module junyou {
    /**
     * HTML工具类
     * @author 3tion
     */
    export const HTMLUtil = (function () {
        const unescChars = { "&lt;": "<", "&gt;": ">", "&quot;": "\"", "&apos;": "\'", "&amp;": "&", "&nbsp;": " ", "&#x000A;": "\n" };
        const escChars = { "<": "&lt;", ">": "&gt;", "'": "&apos;", "\"": "&quot;", "&": "&amp;" };
        return {
            /**
             * 字符着色
             * 
             * @param {string | number} value                内容
             * @param {(string | number)} color     颜色
             * @returns 
             */
            createColorHtml(value: string | number, color: string | number) {
                let c: string;
                if (typeof color == "number") {
                    c = ColorUtil.getColorString(color);
                } else if (color.charAt(0) != "#") {
                    c = "#" + color;
                } else {
                    c = color;
                }
                return "<font color=\'" + c + "\'>" + value + "</font>";
            },

            /**
             * 清理html;
             * @value value
             * @return
             *
             */
            clearHtml(value: string) {
                return value.replace(/<[^><]*?>/g, "");
            },
            /**
             * 将特殊字符串处理为HTML转义字符
             * 
             * @param {string} content 
             */
            escapeHTML(content: string) {
                return content.replace(/<|>|"|'|&/g, substring => {
                    return escChars[substring];
                });
            },
            /**
             * 将HTML特殊符号，恢复成正常字符串
             * 
             * @param {string} content 
             * @returns 
             */
            unescapeHTML(content: string) {
                return content.replace(/&lt;|&gt;|&quot;|&apos;|&amp;|&nbsp;|&#x000A;/g, substring => {
                    return unescChars[substring];
                });
            }
        }
    })();
}