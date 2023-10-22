document.addEventListener("DOMContentLoaded", () => {
  const copyButton = document.getElementById("copy");
  const url = document.getElementById("url");
  const urlInput = document.getElementById("urlInput");
  const urlLength = document.getElementById("urlLength");
  const arrow = document.getElementById("arrow");
  const arrowMenu = document.getElementById("arrow-menu");
  const customUrl = document.getElementById("customUrl");
  const useCustomUrl = document.getElementById("useCustomUrl");
  const useCustomUrlWrapper = document.getElementById("useCustomUrlWrapper");
  const customVisits = document.getElementById("customVisits");
  const useCustomVisits = document.getElementById("useCustomVisits");
  const useCustomVisitsWrapper = document.getElementById("useCustomVisitsWrapper");
  const btns = document.getElementsByClassName("btn");

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

  if (arrow !== null && arrowMenu !== null) {
    arrow.addEventListener("click", () => {
      arrow.classList.toggle("enable");
      arrowMenu.classList.toggle("enable");
    });
  }

  if (useCustomUrlWrapper !== null && useCustomUrl !== null && customUrl !== null) {
    useCustomUrlWrapper.addEventListener("click", () => {
      useCustomUrl.classList.toggle("enable");
      customUrl.classList.toggle("enable");

      document.getElementById("useCustomUrlInput").value = useCustomUrl.classList.contains("enable") ? "true" : "false";
    });

    customUrl.addEventListener("focusin", () => {
      useCustomUrl.classList.add("enable");
      customUrl.classList.add("enable");

      document.getElementById("useCustomUrlInput").value = useCustomUrl.classList.contains("enable") ? "true" : "false";
    })

    customUrl.addEventListener("focusout", () => {
      if (customUrl.value === "") {
        useCustomUrl.classList.remove("enable");
        customUrl.classList.remove("enable");

        document.getElementById("useCustomUrlInput").value = useCustomUrl.classList.contains("enable") ? "true" : "false";
      }
    })
  }

  if (useCustomVisitsWrapper !== null && useCustomVisits !== null && customVisits !== null) {
    useCustomVisitsWrapper.addEventListener("click", () => {
      useCustomVisits.classList.toggle("enable");
      customVisits.classList.toggle("enable");

      document.getElementById("useCustomVisitsInput").value = useCustomVisits.classList.contains("enable") ? "true" : "false";
    });

    customVisits.addEventListener("focusin", () => {
      useCustomVisits.classList.add("enable");
      customVisits.classList.add("enable");

      document.getElementById("useCustomVisitsInput").value = useCustomVisits.classList.contains("enable") ? "true" : "false";
    })

    customVisits.addEventListener("focusout", () => {
      if (customVisits.value === "") {
        useCustomVisits.classList.remove("enable");
        customVisits.classList.remove("enable");

        document.getElementById("useCustomVisitsInput").value = useCustomVisits.classList.contains("enable") ? "true" : "false";
      }
    })
  }

  if (btns !== null) {
    for (const btn of btns) {
      btn.addEventListener("click", () => {
        document.getElementById("useCustomUrlInput").value = useCustomUrl.classList.contains("enable") ? "true" : "false";
        document.getElementById("useCustomVisitsInput").value = useCustomVisits.classList.contains("enable") ? "true" : "false";
        save_data();
      });
    }
  }

  show_saved_data();
});

function save_data(){
  let fields = document.querySelectorAll("input")
  let saved_fields = []
  fields.forEach(x => {
      saved_fields.push({
          key: x.id,
          value: x.value
      })
  })
  localStorage.setItem("saved_data", JSON.stringify(saved_fields))
}

function show_saved_data(){
   JSON.parse(localStorage.getItem("saved_data")).forEach(x => {
       document.getElementById(x.key).value = x.value
   })
}