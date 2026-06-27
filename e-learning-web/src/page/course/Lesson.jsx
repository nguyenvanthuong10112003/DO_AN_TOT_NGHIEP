import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, ChevronRight, ChevronDown, ChevronLeft, FileText, Video as VideoIcon,
  ClipboardCheck, PlayCircle, Lock, CheckCircle2, Check, X, Clock, Eye, MessageCircle,
  Send, Menu, Loader2, ChevronsRight, ThumbsUp, CornerDownRight,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { finishLesson, getCourseDetailById, getLessonById } from "../../service/CourseService";
import { createSession } from "../../service/MediaService";
import { PAGE_LOCATION, QUESTION_TYPE, ScoringMode } from "../../define/define";
import { getUserInfo } from "../../helper/utils";

/* ============================================================================
   CONSTANTS
   ========================================================================== */
const LESSON_TYPE = { ARTICLE: "ARTICLE", VIDEO: "VIDEO", TEST: "TEST" };
const PRIMARY = "#185FA5";

/* ============================================================================
   HELPERS
   ========================================================================== */
const fmtTime = (sec) => {
  const s = Math.floor((sec || 0) % 60).toString().padStart(2, "0");
  const m = Math.floor((sec || 0) / 60);
  return `${m}:${s}`;
};

const typeMeta = {
  [LESSON_TYPE.ARTICLE]: { icon: FileText, label: "Bài viết", color: "#0C447C" },
  [LESSON_TYPE.VIDEO]: { icon: VideoIcon, label: "Video", color: "#085041" },
  [LESSON_TYPE.TEST]: { icon: ClipboardCheck, label: "Bài kiểm tra", color: "#3C3489" },
};
const metaOf = (type) => typeMeta[type] || typeMeta[LESSON_TYPE.ARTICLE];

const playUrl = (sessionId, userId) =>
  `${process.env.REACT_APP_API_MEDIA_SERVICE_BASE_URL}/videos/play?sessionId=${sessionId}&userId=${userId}`;

/* ============================================================================
   BÀI VIẾT — render nội dung HTML; mở bài tiếp theo sau khi đọc đủ thời gian
   ========================================================================== */
function ArticleLesson({ lesson, completed, onComplete }) {
  const REQUIRED = (lesson.duration || 0) * 60; // thời gian đọc tối thiểu (giây)
  const [left, setLeft] = useState(completed ? 0 : REQUIRED);

  useEffect(() => {
    if (completed || REQUIRED <= 0) { setLeft(0); onComplete(lesson.id); return; }
    let remaining = REQUIRED;
    setLeft(remaining);
    const t = setInterval(() => {
      remaining -= 1;
      setLeft(Math.max(0, remaining));
      if (remaining <= 0) { clearInterval(t); onComplete(lesson.id); }
    }, 1000);
    return () => clearInterval(t);
  }, [lesson.id, completed, REQUIRED, onComplete]);

  const ready = completed || left <= 0;

  return (
    <div>
      <article
        className="ProseMirrorView prose-sm max-w-none text-[15px] leading-7 text-slate-700"
        dangerouslySetInnerHTML={{ __html: lesson.article?.content || "" }}
      />

      <div className={`mt-6 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
        ready ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"
      }`}>
        {ready ? <CheckCircle2 size={18} /> : <Clock size={18} />}
        {ready ? "Bạn đã có thể chuyển sang bài tiếp theo." : `Đọc thêm ${left}s để mở khóa bài tiếp theo…`}
      </div>
    </div>
  );
}

/* ============================================================================
   VIDEO — phát qua media-service (session tự gia hạn trước khi hết hạn)
   Mở bài tiếp theo sau khi xem đủ thời lượng tối thiểu (bỏ qua tua nhảy)
   ========================================================================== */
function VideoLesson({ lesson, completed, onComplete }) {
  const videoRef = useRef(null);
  const lastTimeRef = useRef(0);
  const doneRef = useRef(completed);
  const [session, setSession] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const user = getUserInfo();
  const videoInfo = lesson.video?.videoInfo;
  const duration = videoInfo?.duration || 0;
  // Yêu cầu xem tối thiểu theo lesson.duration (phút), giới hạn bởi độ dài video thật
  const reqSec = (lesson.duration || 0) * 60;
  const MIN = reqSec > 0 ? Math.min(reqSec, duration || reqSec) : 0;
  const [watched, setWatched] = useState(completed ? MIN : 0);

  // Không có ngưỡng tối thiểu → coi như hoàn thành ngay
  useEffect(() => {
    if (!completed && MIN <= 0) onComplete(lesson.id);
  }, [lesson.id, completed, MIN, onComplete]);

  // Tạo phiên xem khi đổi video
  useEffect(() => {
    let alive = true;
    doneRef.current = completed;
    lastTimeRef.current = 0;
    setWatched(completed ? MIN : 0);
    if (!videoInfo?.id) return;
    createSession(videoInfo.id)
      .then((res) => { if (alive) setSession(res.data.data); })
      .catch(() => { });
    return () => { alive = false; };
  }, [videoInfo?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tự gia hạn phiên trước khi hết hạn (không reload từ đầu — giữ nguyên vị trí)
  useEffect(() => {
    if (!session?.id || !videoInfo?.id) return;
    const delay = new Date(session.expireAt).getTime() - Date.now();
    if (delay <= 0) return;
    const timer = setTimeout(async () => {
      setRefreshing(true);
      try {
        const res = await createSession(videoInfo.id);
        const ns = res.data.data;
        const v = videoRef.current;
        if (v) {
          const cur = v.currentTime, paused = v.paused;
          const src = v.querySelector("source");
          if (src) {
            src.src = playUrl(ns.id, user.id);
            v.load();
            v.addEventListener("loadedmetadata", () => {
              v.currentTime = cur;
              if (!paused) v.play().catch(() => { });
            }, { once: true });
          }
        }
        setSession(ns);
      } catch { /* interceptor đã toast */ }
      finally { setRefreshing(false); }
    }, delay);
    return () => clearTimeout(timer);
  }, [session?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || MIN <= 0) return;
    const cur = v.currentTime;
    const delta = cur - lastTimeRef.current;
    if (delta > 0 && delta < 1.5) {
      setWatched((w) => {
        const nw = Math.min(MIN, w + delta);
        if (!doneRef.current && nw >= MIN) { doneRef.current = true; onComplete(lesson.id); }
        return nw;
      });
    }
    lastTimeRef.current = cur;
  };

  const ready = completed || MIN <= 0 || watched >= MIN;
  const pct = MIN > 0 ? Math.min(100, Math.round((watched / MIN) * 100)) : 100;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-xs">
        {refreshing && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-600">
            <Loader2 size={13} className="animate-spin" /> Đang gia hạn phiên xem…
          </span>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl bg-black">
        {videoInfo?.id && session?.id ? (
          <video
            ref={videoRef}
            controls
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
            onTimeUpdate={handleTimeUpdate}
            className="aspect-video w-full"
          >
            <source src={playUrl(session.id, user.id)} type="video/mp4" />
          </video>
        ) : (
          <div className="flex aspect-video w-full items-center justify-center text-slate-400">
            <Loader2 size={22} className="animate-spin" />
          </div>
        )}
      </div>

      {lesson.video?.summary && <p className="mt-4 text-[15px] leading-7 text-slate-700">{lesson.video.summary}</p>}

      {MIN > 0 && (
        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
            <span>Đã xem {fmtTime(watched)} / tối thiểu {fmtTime(MIN)}</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: ready ? "#10b981" : PRIMARY }} />
          </div>
          <div className={`mt-3 flex items-center gap-2 text-sm ${ready ? "text-emerald-700" : "text-slate-500"}`}>
            {ready ? <CheckCircle2 size={16} /> : <PlayCircle size={16} />}
            {ready ? "Đã xem đủ thời lượng — có thể chuyển bài." : "Xem đủ thời lượng tối thiểu để mở bài tiếp theo."}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   BÀI KIỂM TRA — CHOICE / MULTI_CHOICE / ARGUMENT
   scoringMode: PER_QUESTION (hé lộ ngay) | AFTER_COMPLETION (chấm khi nộp)
   Qua bài: trả lời hết + đạt điểm tối thiểu (passScore %)
   ========================================================================== */
const isChoice = (type) => type === QUESTION_TYPE.CHOICE.id || type === QUESTION_TYPE.MULTI_CHOICE.id;

function gradeQuestion(q, ans) {
  if (q.type === QUESTION_TYPE.ARGUMENT.id)
    return String(ans ?? "").trim().toLowerCase() === String(q.answer ?? "").trim().toLowerCase();
  const correct = (q.answers || []).filter((a) => a.isCorrect).map((a) => a.id);
  const sel = Array.isArray(ans) ? ans : [];
  return correct.length === sel.length && correct.every((id) => sel.includes(id));
}

function isAnswered(q, ans) {
  if (q.type === QUESTION_TYPE.ARGUMENT.id) return String(ans ?? "").trim().length > 0;
  return Array.isArray(ans) && ans.length > 0;
}

function TestLesson({ lesson, completed, onComplete }) {
  const test = lesson.test || {};
  const questions = useMemo(() => test.questions || [], [test.questions]);
  const passScore = lesson.passScore ?? 0;
  const showAnswer = lesson.showAnswer !== false;
  const perQuestion = lesson.scoringMode === ScoringMode.PER_QUESTION.key;

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const firedRef = useRef(completed);

  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
    firedRef.current = completed;
  }, [lesson.id, completed]);

  const totalScore = useMemo(
    () => questions.reduce((s, q) => s + (Number(q.score) || 0), 0),
    [questions]
  );
  const earned = useMemo(
    () => questions.reduce((s, q) => s + (gradeQuestion(q, answers[q.id]) ? (Number(q.score) || 0) : 0), 0),
    [questions, answers]
  );
  const scorePct = totalScore > 0 ? Math.round((earned / totalScore) * 100) : 0;

  const allAnswered = questions.every((q) => isAnswered(q, answers[q.id]));
  const finished = perQuestion ? allAnswered : submitted;
  const revealQuestion = (q) => (perQuestion ? isAnswered(q, answers[q.id]) : submitted);
  const passed = finished && scorePct >= passScore;

  useEffect(() => {
    if (passed && !firedRef.current) { firedRef.current = true; onComplete(lesson.id); }
  }, [passed, lesson.id, onComplete]);

  const choose = (q, answerId) => {
    if (perQuestion && isAnswered(q, answers[q.id])) return; // khóa sau khi trả lời
    if (!perQuestion && submitted) return;
    setAnswers((a) => {
      if (q.type === QUESTION_TYPE.MULTI_CHOICE.id) {
        const cur = Array.isArray(a[q.id]) ? a[q.id] : [];
        return { ...a, [q.id]: cur.includes(answerId) ? cur.filter((x) => x !== answerId) : [...cur, answerId] };
      }
      return { ...a, [q.id]: [answerId] };
    });
  };

  const typeArgument = (q, value) => {
    if (!perQuestion && submitted) return;
    setAnswers((a) => ({ ...a, [q.id]: value }));
  };

  const reset = () => { setAnswers({}); setSubmitted(false); };

  const optClass = (q, a) => {
    const reveal = revealQuestion(q) && showAnswer;
    const selected = (answers[q.id] || []).includes(a.id);
    if (reveal && a.isCorrect) return "border-emerald-300 bg-emerald-50 text-emerald-800";
    if (reveal && selected && !a.isCorrect) return "border-rose-300 bg-rose-50 text-rose-700";
    if (selected) return "border-[#185FA5] bg-[#185FA5]/5 text-slate-800";
    return "border-slate-200 hover:border-slate-300 text-slate-700";
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-[#FAEEDA] px-2.5 py-1 font-medium text-[#854F0B]">
          {perQuestion ? "Chấm ngay sau mỗi câu" : "Chấm sau khi nộp bài"}
        </span>
        <span className="text-slate-400">{questions.length} câu · điểm đạt ≥ {passScore}%</span>
      </div>

      <div className="flex flex-col gap-5">
        {questions.map((q, qi) => {
          const reveal = revealQuestion(q) && showAnswer;
          return (
            <div key={q.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-3 flex gap-2 text-[15px] font-semibold text-slate-800">
                <span className="text-slate-400">{qi + 1}.</span>
                <div className="ProseMirrorView flex-1" dangerouslySetInnerHTML={{ __html: q.content || "" }} />
                {q.score != null && <span className="flex-shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">{q.score} điểm</span>}
              </div>

              {/* CHOICE / MULTI_CHOICE */}
              {isChoice(q.type) && (
                <div className="flex flex-col gap-2">
                  {(q.answers || []).map((a, oi) => {
                    const selected = (answers[q.id] || []).includes(a.id);
                    return (
                      <button
                        key={a.id}
                        onClick={() => choose(q, a.id)}
                        disabled={reveal || (perQuestion && isAnswered(q, answers[q.id]))}
                        className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition ${optClass(q, a)} ${reveal ? "cursor-default" : "cursor-pointer"}`}
                      >
                        <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                          selected ? "border-current" : "border-slate-300 text-slate-400"
                        }`}>
                          {String.fromCharCode(65 + oi)}
                        </span>
                        <span className="flex-1">{a.content}</span>
                        {reveal && a.isCorrect && <Check size={16} className="text-emerald-600" />}
                        {reveal && selected && !a.isCorrect && <X size={16} className="text-rose-500" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ARGUMENT — trả lời tự luận */}
              {q.type === QUESTION_TYPE.ARGUMENT.id && (
                <div>
                  <textarea
                    value={answers[q.id] || ""}
                    onChange={(e) => typeArgument(q, e.target.value)}
                    disabled={reveal}
                    rows={2}
                    placeholder="Nhập câu trả lời của bạn…"
                    className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#185FA5] disabled:bg-slate-50"
                  />
                  {reveal && (
                    <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-[13px] text-slate-600">
                      <div><span className="font-semibold text-slate-700">Đáp án: </span>{q.answer}</div>
                      {q.instruction && <div className="mt-1"><span className="font-semibold text-slate-700">Hướng dẫn: </span>{q.instruction}</div>}
                    </div>
                  )}
                </div>
              )}

              {reveal && q.explain && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-[13px] text-slate-600">
                  <FontAwesomeIcon icon={faCircleQuestion} className="mt-0.5 text-slate-400" />
                  <span>{q.explain}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Nộp bài (chế độ chấm sau khi hoàn thành) */}
      {!perQuestion && !submitted && (
        <button
          onClick={() => setSubmitted(true)}
          disabled={!allAnswered}
          className="mt-5 w-full rounded-xl bg-[#185FA5] py-2.5 text-sm font-semibold text-white transition hover:bg-[#134d86] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {allAnswered ? "Nộp bài" : `Trả lời hết ${questions.length} câu để nộp`}
        </button>
      )}

      {/* Kết quả */}
      {finished && (
        <div className={`mt-5 flex flex-col gap-3 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between ${
          passed ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full text-white ${passed ? "bg-emerald-500" : "bg-rose-500"}`}>
              {passed ? <CheckCircle2 size={26} /> : <X size={26} />}
            </div>
            <div>
              <div className={`text-lg font-bold ${passed ? "text-emerald-700" : "text-rose-700"}`}>
                {scorePct}% · {earned}/{totalScore} điểm
              </div>
              <div className="text-sm text-slate-600">
                {passed ? "Đạt! Bạn có thể chuyển sang bài tiếp theo." : `Chưa đạt mức tối thiểu ${passScore}%. Hãy thử lại.`}
              </div>
            </div>
          </div>
          {!passed && (
            <button onClick={reset} className="rounded-xl border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50">
              Làm lại
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   BÌNH LUẬN — hỏi đáp của học viên (dữ liệu mẫu — nối API ở bước sau)
   ========================================================================== */
const SEED_COMMENTS = [
  { id: 1, name: "Trần Hương", time: "2 ngày trước", text: "Phần này giảng dễ hiểu quá, cảm ơn thầy ạ!", likes: 4,
    replies: [{ id: 11, name: "Giảng viên", time: "1 ngày trước", text: "Cảm ơn em, cố gắng làm bài tập cuối chương nhé!" }] },
  { id: 2, name: "Lê Quốc", time: "5 giờ trước", text: "Cho mình hỏi useMemo và useCallback khác nhau chỗ nào vậy?", likes: 1, replies: [] },
];

function CommentSection() {
  const [comments, setComments] = useState(SEED_COMMENTS);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  const post = () => {
    if (!text.trim()) return;
    setComments((c) => [{ id: Date.now(), name: "Bạn", time: "Vừa xong", text: text.trim(), likes: 0, replies: [] }, ...c]);
    setText("");
  };
  const postReply = (cid) => {
    if (!replyText.trim()) return;
    setComments((c) => c.map((cm) => cm.id === cid
      ? { ...cm, replies: [...cm.replies, { id: Date.now(), name: "Bạn", time: "Vừa xong", text: replyText.trim() }] }
      : cm));
    setReplyText(""); setReplyTo(null);
  };
  const like = (cid) => setComments((c) => c.map((cm) => cm.id === cid ? { ...cm, likes: cm.likes + 1 } : cm));

  const Avatar = ({ name }) => (
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#185FA5]/10 text-sm font-semibold text-[#185FA5]">
      {name.charAt(0)}
    </div>
  );

  return (
    <div className="mt-8 border-t border-slate-200 pt-6">
      <div className="mb-4 flex items-center gap-2 text-[15px] font-semibold text-slate-800">
        <MessageCircle size={18} style={{ color: PRIMARY }} /> Hỏi đáp · Bình luận
        <span className="text-sm font-normal text-slate-400">({comments.length})</span>
      </div>

      <div className="mb-6 flex gap-3">
        <Avatar name="Bạn" />
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Đặt câu hỏi hoặc chia sẻ suy nghĩ của bạn…"
            rows={2}
            className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#185FA5]"
          />
          <div className="mt-2 flex justify-end">
            <button onClick={post} disabled={!text.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#185FA5] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#134d86] disabled:opacity-50">
              <Send size={14} /> Gửi
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {comments.map((cm) => (
          <div key={cm.id} className="flex gap-3">
            <Avatar name={cm.name} />
            <div className="flex-1">
              <div className="rounded-xl bg-slate-50 px-3.5 py-2.5">
                <div className="mb-0.5 flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800">{cm.name}</span>
                  <span className="text-xs text-slate-400">{cm.time}</span>
                </div>
                <p className="text-sm text-slate-700">{cm.text}</p>
              </div>
              <div className="mt-1 flex items-center gap-4 pl-1 text-xs text-slate-500">
                <button onClick={() => like(cm.id)} className="inline-flex items-center gap-1 hover:text-[#185FA5]">
                  <ThumbsUp size={13} /> {cm.likes > 0 && cm.likes} Thích
                </button>
                <button onClick={() => setReplyTo(replyTo === cm.id ? null : cm.id)} className="hover:text-[#185FA5]">Trả lời</button>
              </div>

              {cm.replies.map((r) => (
                <div key={r.id} className="mt-2 flex gap-2 pl-4">
                  <CornerDownRight size={16} className="mt-2 flex-shrink-0 text-slate-300" />
                  <Avatar name={r.name} />
                  <div className="flex-1 rounded-xl bg-slate-50 px-3.5 py-2">
                    <div className="mb-0.5 flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">{r.name}</span>
                      <span className="text-xs text-slate-400">{r.time}</span>
                    </div>
                    <p className="text-sm text-slate-700">{r.text}</p>
                  </div>
                </div>
              ))}

              {replyTo === cm.id && (
                <div className="mt-2 flex gap-2 pl-4">
                  <input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && postReply(cm.id)}
                    placeholder={`Trả lời ${cm.name}…`}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-[#185FA5]"
                  />
                  <button onClick={() => postReply(cm.id)} className="rounded-lg bg-[#185FA5] px-3 text-sm font-semibold text-white hover:bg-[#134d86]">Gửi</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
   SIDEBAR — cây Chương > Bài học (từ course.chapters)
   ========================================================================== */
function ChapterTree({ chapters, currentId, completed, isUnlocked, onSelect, expanded, toggle }) {
  return (
    <div className="flex flex-col">
      {chapters.map((chapter) => (
        <div key={chapter.id} className="border-b border-slate-100">
          <button onClick={() => toggle("chapter", chapter.id)}
            className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-slate-50">
            <ChevronDown size={15} className={`text-slate-400 transition-transform ${expanded.has("chapter:" + chapter.id) ? "" : "-rotate-90"}`} />
            <span className="flex-1 text-sm font-semibold text-slate-800">{chapter.name}</span>
            <span className="flex-shrink-0 text-xs text-slate-400">{chapter.totalLesson ?? chapter.lessons?.length ?? 0} bài</span>
          </button>

          {expanded.has("chapter:" + chapter.id) && (
            <ul className="pb-1">
              {(chapter.lessons || []).map((lesson) => {
                const unlocked = isUnlocked(lesson.id);
                const isCurrent = String(lesson.id) === String(currentId);
                const done = completed[lesson.id];
                const TIcon = metaOf(lesson.type).icon;
                return (
                  <li key={lesson.id}>
                    <button
                      disabled={!unlocked}
                      onClick={() => unlocked && onSelect(lesson.id)}
                      title={unlocked ? lesson.name : "Hoàn thành bài trước để mở khóa"}
                      className={`flex w-full items-center gap-2.5 py-2 pl-9 pr-4 text-left text-[13px] transition ${
                        isCurrent ? "bg-[#185FA5]/10 font-medium text-[#185FA5]"
                          : unlocked ? "text-slate-600 hover:bg-slate-50" : "cursor-not-allowed text-slate-400"
                      }`}
                    >
                      {done ? <CheckCircle2 size={15} className="flex-shrink-0 text-emerald-500" />
                        : !unlocked ? <Lock size={13} className="flex-shrink-0 text-slate-300" />
                        : <TIcon size={15} className="flex-shrink-0" style={{ color: isCurrent ? PRIMARY : metaOf(lesson.type).color }} />}
                      <span className="flex-1 truncate">{lesson.name}</span>
                      {lesson.canPreview && !unlocked && <Eye size={13} className="flex-shrink-0 text-slate-400" />}
                    </button>
                  </li>
                );
              })}
              {!(chapter.lessons || []).length && (
                <li className="py-2 pl-9 pr-4 text-[13px] text-slate-400">Chưa có bài học</li>
              )}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

/* ============================================================================
   TRANG HỌC BÀI
   ========================================================================== */
export default function LearnLesson() {
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const lessonId = searchParams.get("lessonId");
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [completed, setCompleted] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState(new Set());
  const finishedRef = useRef(new Set()); // các bài đã gọi API hoàn thành — tránh gọi lại

  // Làm phẳng cây chương > bài để điều hướng prev/next + tra cứu chương
  const flat = useMemo(() => {
    const out = [];
    (course?.chapters || []).forEach((ch) =>
      (ch.lessons || []).forEach((l) => out.push({ ...l, chapterId: ch.id, chapterName: ch.name })));
    return out;
  }, [course]);

  // Theo dõi thay đổi của courseId để lấy thông tin khóa học hiện tại
  useEffect(() => {
    if (!courseId) return;
    getCourseDetailById(courseId)
      .then((res) => setCourse(res.data.data))
      .catch(() => { });
  }, [courseId]);

  // Khởi tạo trạng thái hoàn thành từ dữ liệu khóa học
  useEffect(() => {
    if (!course?.chapters) return;
    const init = {};
    course.chapters.forEach((ch) => (ch.lessons || []).forEach((l) => {
      if (l.completed) { init[l.id] = true; finishedRef.current.add(l.id); }
    }));
    setCompleted(init);
  }, [course]);

  // Lấy bài học theo lessonId; kiểm tra bài học có thuộc khóa học hiện tại không
  useEffect(() => {
    if (!lessonId) return;
    setLesson(null);
    getLessonById(lessonId)
      .then((res) => {
        const data = res.data.data;
        if (String(data.course?.id ?? data.courseId) !== String(courseId)) {
          toast.error("Bài học không thuộc khóa học này");
          return;
        }
        setLesson(data);
      })
      .catch(() => { });
  }, [courseId, lessonId]);

  const idx = flat.findIndex((l) => String(l.id) === String(lessonId));
  const current = idx >= 0 ? flat[idx] : null;
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx >= 0 ? flat[idx + 1] : null;

  const completedCount = flat.filter((l) => completed[l.id]).length;
  const progressPct = flat.length ? Math.round((completedCount / flat.length) * 100) : 0;

  // Khóa bài: bài đầu luôn mở; bài cho xem trước luôn mở;
  // còn lại chỉ bị khóa khi bài liền trước YÊU CẦU hoàn thành (requireFinish) mà chưa hoàn thành
  const isUnlocked = useCallback((id) => {
    const i = flat.findIndex((l) => String(l.id) === String(id));
    if (i <= 0) return true;
    if (flat[i].canPreview) return true;
    const previous = flat[i - 1];
    if (!previous.requireFinish) return true;
    return !!completed[previous.id];
  }, [flat, completed]);

  const markComplete = useCallback((id) => {
    if (id == null || finishedRef.current.has(id)) return;
    finishedRef.current.add(id);
    setCompleted((c) => (c[id] ? c : { ...c, [id]: true }));
    finishLesson(id).catch(() => { }); // báo backend đã hoàn thành bài
  }, []);

  const toggle = useCallback((kind, id) => {
    setExpanded((prev) => {
      const key = kind + ":" + id;
      const nextSet = new Set(prev);
      nextSet.has(key) ? nextSet.delete(key) : nextSet.add(key);
      return nextSet;
    });
  }, []);

  // Tự mở rộng chương chứa bài hiện tại + cuộn lên đầu khi đổi bài
  useEffect(() => {
    if (!current) return;
    setExpanded((prev) => new Set(prev).add("chapter:" + current.chapterId));
    setSidebarOpen(false);
    window.scrollTo?.({ top: 0 });
  }, [current?.chapterId, lessonId]); // eslint-disable-line react-hooks/exhaustive-deps

  const goToLesson = (id) => navigate(PAGE_LOCATION.USER_LEARN_LESSON(courseId, id));
  const canNext = next && !!completed[lessonId];

  const activeType = lesson?.type;
  const lessonReady = lesson && String(lesson.id) === String(lessonId);

  return (
    <div className="flex h-screen flex-col bg-slate-50 text-slate-700">

      {/* HEADER */}
      <header className="z-20 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-2.5">
        <button onClick={() => navigate(PAGE_LOCATION.USER_COURSE_DETAIL(courseId))}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100">
          <ArrowLeft size={16} /> <span className="hidden sm:inline">Quay lại</span>
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-1.5 text-[13px] text-slate-500">
          <span className="truncate">{course?.name}</span>
          {current?.chapterName && <>
            <ChevronRight size={14} className="flex-shrink-0 text-slate-300" />
            <span className="truncate font-medium text-slate-700">{current.chapterName}</span>
          </>}
        </div>
        <button onClick={() => setSidebarOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 lg:hidden">
          <Menu size={16} /> Nội dung
        </button>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* MAIN */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
            {!lessonReady ? (
              <div className="flex items-center justify-center py-20 text-slate-400">
                <Loader2 size={24} className="animate-spin" />
              </div>
            ) : (
              <>
                <div className="mb-1 flex items-center gap-2 text-xs font-medium" style={{ color: metaOf(activeType).color }}>
                  {(() => { const I = metaOf(activeType).icon; return <I size={14} />; })()}
                  {metaOf(activeType).label}
                </div>
                <h1 className="mb-5 text-xl font-bold text-slate-900 sm:text-2xl">{lesson.name}</h1>
                {lesson.description && <p className="-mt-3 mb-5 text-sm text-slate-500">{lesson.description}</p>}

                {activeType === LESSON_TYPE.ARTICLE && (
                  <ArticleLesson key={lesson.id} lesson={lesson} completed={!!completed[lesson.id]} onComplete={markComplete} />
                )}
                {activeType === LESSON_TYPE.VIDEO && (
                  <VideoLesson key={lesson.id} lesson={lesson} completed={!!completed[lesson.id]} onComplete={markComplete} />
                )}
                {activeType === LESSON_TYPE.TEST && (
                  <TestLesson key={lesson.id} lesson={lesson} completed={!!completed[lesson.id]} onComplete={markComplete} />
                )}

                <CommentSection key={lesson.id} />
              </>
            )}
          </div>
        </main>

        {/* SIDEBAR (desktop tĩnh / mobile drawer) */}
        {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
        <aside className={`fixed inset-y-0 right-0 z-40 w-80 transform overflow-y-auto border-l border-slate-200 bg-white transition-transform lg:static lg:z-0 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}>
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <span className="text-sm font-semibold text-slate-800">Nội dung khóa học</span>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden"><X size={18} className="text-slate-400" /></button>
          </div>
          <ChapterTree
            chapters={course?.chapters || []}
            currentId={lessonId}
            completed={completed}
            isUnlocked={isUnlocked}
            onSelect={goToLesson}
            expanded={expanded}
            toggle={toggle}
          />
        </aside>
      </div>

      {/* FOOTER */}
      <footer className="z-20 flex items-center gap-3 border-t border-slate-200 bg-white px-4 py-2.5">
        <button onClick={() => prev && goToLesson(prev.id)} disabled={!prev}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
          <ChevronLeft size={16} /> <span className="hidden sm:inline">Bài trước</span>
        </button>

        <div className="flex flex-1 flex-col items-center">
          <div className="mb-1 text-xs text-slate-500">{completedCount}/{flat.length} bài hoàn thành · {progressPct}%</div>
          <div className="h-1.5 w-full max-w-md overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-gradient-to-r from-[#185FA5] to-[#3b8fd4] transition-all" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <button onClick={() => canNext && goToLesson(next.id)} disabled={!canNext}
          title={!next ? "Đây là bài cuối" : !completed[lessonId] ? "Hoàn thành bài hiện tại để tiếp tục" : ""}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#185FA5] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#134d86] disabled:cursor-not-allowed disabled:opacity-40">
          <span className="hidden sm:inline">Bài sau</span> <ChevronsRight size={16} />
        </button>
      </footer>
    </div>
  );
}
