export const copyText = function (content: string) {
  let eleTextarea: any = document.querySelector('#tempTextarea');

  if (!eleTextarea && !navigator.clipboard) {
    eleTextarea = document.createElement('textarea');
    eleTextarea.id = 'tempTextarea';
    eleTextarea.style.width = 0;
    eleTextarea.style.position = 'fixed';
    eleTextarea.style.left = '-999px';
    eleTextarea.style.top = '10px';
    document.body.appendChild(eleTextarea);
  }

  const funCopy = function (text: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      eleTextarea.value = text;
      eleTextarea.select();
      document.execCommand('copy', true);
    }
  };

  funCopy(content);
};
