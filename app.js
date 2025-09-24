(() => {
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");
  const toggleBtn  = document.getElementById("toggleBtn");
  const announceEl = document.getElementById("announce");

  let startTs = null;           
  let alreadyElapsedMs = 0;     
  let rafId = null;             
  let fired5 = false;           
  let fired10 = false;          
  let running = false;          

  // 🔔 Yerel dosya: bell.mp3 aynı klasörde olmalı
  const bellSound = new Audio("bell.mp3");

  function playBell(){
    bellSound.currentTime = 0;  
    bellSound.play().catch(()=>{}); 
  }

  function format2(n){ return n.toString().padStart(2, "0"); }

  function render(ms){
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    minutesEl.textContent = format2(m);
    secondsEl.textContent = format2(s);
    document.title = `${format2(m)}:${format2(s)} • Kronometre`;

    // 🔽 İlerleme barını güncelle
    // 0 → 10 dakika = 600 saniye
    const progress = Math.min((totalSec / 600) * 100, 100);
    document.getElementById("progressBar").style.width = progress + "%";
  }

  function tick(){
    const now = Date.now();
    const elapsed = now - startTs;
    render(elapsed);

    const sec = Math.floor(elapsed / 1000);

    if (!fired5 && sec >= 5 * 60) {
      fired5 = true;
      playBell();
      announce("5. dakikaya ulaşıldı.");
    }
    if (!fired10 && sec >= 10 * 60) {
      fired10 = true;
      playBell();
      announce("10. dakikaya ulaşıldı.");
    }

    rafId = requestAnimationFrame(tick);
  }

  function start(){
    startTs = Date.now() - alreadyElapsedMs; 
    rafId = requestAnimationFrame(tick);
    toggleBtn.classList.add("is-running");
    toggleBtn.textContent = "Duraklat";
    toggleBtn.setAttribute("aria-pressed", "true");
    running = true;
  }

  function pause(){
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    alreadyElapsedMs = Date.now() - startTs; 
    toggleBtn.classList.remove("is-running");
    toggleBtn.textContent = "Sürdür";
    toggleBtn.setAttribute("aria-pressed", "false");
    running = false;
  }

  function reset(){
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    startTs = null;
    alreadyElapsedMs = 0;
    fired5 = false;
    fired10 = false;
    render(0);
    toggleBtn.classList.remove("is-running");
    toggleBtn.textContent = "Başlat";
    toggleBtn.setAttribute("aria-pressed", "false");
    running = false;
    announce("Kronometre sıfırlandı.");
  }

  function announce(text){
    announceEl.textContent = text;
    if (navigator.vibrate) navigator.vibrate([80,40,80]);
  }

  render(0);

  toggleBtn.addEventListener("click", () => {
    if (!running){
      if (alreadyElapsedMs === 0){
        fired5 = false;
        fired10 = false;
      }
      start();
    } else {
      pause();
    }
  });

  // Klavye kısayolları
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") { // Başlat/Duraklat
      e.preventDefault();
      toggleBtn.click();
    }
    if (e.key.toLowerCase() === "e") { // Manuel zil
      playBell();
      announce("Manuel zil çaldı.");
    }
    if (e.key.toLowerCase() === "r") { // Reset
      reset();
    }
  });
})();
