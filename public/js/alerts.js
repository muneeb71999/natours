export default function alertMessage(errorType, mes) {
  const body = document.querySelector("body");
  const alert = document.querySelector(".alert");
  if (alert) {
    hideAlert();
  }
  const message = `<div><div class="alert alert--${errorType}">${mes}</div></div>`;
  body.insertAdjacentHTML("afterbegin", message);
  setTimeout((_) => {
    hideAlert();
  }, 2500);
}

function hideAlert() {
  const alert = document.querySelector(".alert");
  if (alert) alert.parentElement.remove();
}
