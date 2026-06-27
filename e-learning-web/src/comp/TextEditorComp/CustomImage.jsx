import Image from "@tiptap/extension-image";

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),

      class: {
        default: null,
      },
      imageId: {
        default: null,
      },
      imageObj: {
        default: null,
      }
    };
  },
});

export default CustomImage;