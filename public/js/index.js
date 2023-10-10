document.addEventListener("DOMContentLoaded", () => {
  const copyButton = document.getElementById("copy");
  const url = document.getElementById("url");

  copyButton.addEventListener("click", () => {
    const copyText = url.innerText
    const textArea = document.createElement("textArea")
    textArea.innerText = copyText
    document.body.append(textArea)
    textArea.select()
    document.execCommand("copy")
    copyButton.innerText = "Copied"
    textArea.remove()
    setTimeout(function() { copyButton.innerText = "Copy" }, 1000); 
  });

  url.addEventListener("click", () => {
    const range = document.createRange();
    range.selectNodeContents(url);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  })
});