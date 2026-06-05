const form = document.getElementById("form");
const pageUrl = document.getElementById("page-url");
const heading = document.getElementById("heading");
const output = document.getElementById("output");
const video = document.getElementById("video");
const hint = document.getElementById("hint");
const m3u8 = document.getElementById("m3u8");
const error = document.getElementById("error");
const submit = form.querySelector("button");
const safariHls = video.canPlayType("application/vnd.apple.mpegurl");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  submit.disabled = true;
  error.hidden = true;
  output.hidden = true;
  video.removeAttribute("src");
  video.load();
  try {
    const response = await fetch("/api/stream?url=" + encodeURIComponent(pageUrl.value.trim()));
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "resolve failed");
    }
    if (!data.url) {
      throw new Error(`no direct stream (mode: ${data.mode})`);
    }
    if (data.title) {
      heading.textContent = data.title;
    }
    m3u8.value = data.url;
    output.hidden = false;
    hint.hidden = true;
    if (safariHls) {
      video.hidden = false;
      video.src = data.url;
      video.play().catch(() => {});
    } else {
      video.hidden = true;
      hint.textContent = "Copy the m3u8 for VLC or Stremio — cross-origin HLS is blocked here.";
      hint.hidden = false;
    }
  } catch (err) {
    error.textContent = err.message;
    error.hidden = false;
  } finally {
    submit.disabled = false;
  }
});

document.getElementById("copy").addEventListener("click", () => {
  m3u8.select();
  navigator.clipboard.writeText(m3u8.value).catch(() => {});
});
