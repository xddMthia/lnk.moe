document.addEventListener("DOMContentLoaded", () => {
  const copyButton = document.getElementById("copy");
  const url = document.getElementById("url");
  const urlInput = document.getElementById("urlInput");
  const urlLength = document.getElementById("urlLength");
  const arrows = document.getElementsByClassName("arrow");

  if (copyButton !== null) {
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
  }

  if (url !== null) {
    url.addEventListener("click", () => {
      const range = document.createRange();
      range.selectNodeContents(url);
  
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    })
  }

  if (urlInput !== null && urlLength !== null) {
    urlInput.addEventListener("input", () => {
      const currentLength = urlInput.value.length;
      const remainingCharacters = 1024 - currentLength;
  
      if (remainingCharacters < 25) {
        urlLength.textContent = remainingCharacters;
      } else {
        urlLength.textContent = "";
      }
    });
  }

  if (arrows !== null) {
    for (arrow of arrows) {
      arrow.addEventListener("click", () => {
        arrow.classList.toggle("enable");
      });
    }
  }
});