const $ = (id) => document.getElementById(id);

const showMessage = (text) => {
  const box = $("message");
  box.textContent = text; // textContent, never innerHTML
  box.style.display = text ? "block" : "none";
};

// The address fields only matter in client mode
const syncVisibility = () => {
  $("client-fields").style.display = $("mode-client").checked ? "block" : "none";
};

const init = async () => {
  const cfg = await window.weighwiz.getConfig();

  $(cfg.mode === "server" ? "mode-server" : "mode-client").checked = true;
  $("host").value = cfg.serverHost || "";
  $("port").value = cfg.serverPort || 8080;

  const message = new URLSearchParams(window.location.search).get("message");
  if (message) showMessage(message);

  syncVisibility();
};

$("mode-client").addEventListener("change", syncVisibility);
$("mode-server").addEventListener("change", syncVisibility);

$("save").addEventListener("click", async () => {
  showMessage("");

  const result = await window.weighwiz.saveConfig({
    mode: $("mode-server").checked ? "server" : "client",
    serverHost: $("host").value,
    serverPort: $("port").value,
  });

  if (!result.ok) showMessage(result.error);
});

$("retry").addEventListener("click", () => window.weighwiz.retry());

init();
