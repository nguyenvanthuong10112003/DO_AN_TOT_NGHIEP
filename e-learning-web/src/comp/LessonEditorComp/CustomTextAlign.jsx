import TextAlign from "@tiptap/extension-text-align";

export const CustomTextAlign = TextAlign.extend({
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textAlign: {
            default: "left",

            renderHTML: (attributes) => {
              return {
                class: `text-${attributes.textAlign}`,
              };
            },

            parseHTML: (element) => {
              const cls = element.className;

              if (cls.includes("text-center")) return "center";
              if (cls.includes("text-right")) return "right";
              if (cls.includes("text-justify")) return "justify";

              return "left";
            },
          },
        },
      },
    ];
  },
});