(function () {
  const CATEGORY_LIST = [
    "Tide",
    "Sediment",
    "Ocean Waves",
    "Marine Pollution",
    "Fishery",
    "Ecology And Biota",
    "Chemistry",
    "Climatology And Meteorology Atmosphere",
    "Disaster Mitigation",
    "Ocean Current",
  ];

  const mount = document.getElementById("sidebar-container");
  fetch("sidebar.html")
    .then((r) => r.text())
    .then((html) => {
      mount.innerHTML = html;
      initSidebar();
    });

  function initSidebar() {
    const sidebar = document.getElementById("sidebar");
    const openBtn = document.getElementById("openSidebar");
    const filterInline = document.getElementById("filterInline"); 
    const filterGroup = document.getElementById("filterGroup");
    const btnSelectAll = document.getElementById("btnSelectAll");
    const btnClear = document.getElementById("btnClear");
    const applyFilter = document.getElementById("applyFilter");
    const resetView = document.getElementById("resetView");
    const activeChips = document.getElementById("activeChips");
    const searchInput = document.getElementById("categorySearch");

    function openSidebar() {
      sidebar.classList.add("open");
      if (filterInline) filterInline.classList.add("hidden");
    }

     function closeSidebar() {
        sidebar.classList.remove("open");
        if (filterInline) filterInline.classList.remove("hidden"); 
     }

    CATEGORY_LIST.forEach((cat) => {
      const id = "cat_" + cat.replace(/\s+/g, "_");
      const wrap = document.createElement("label");
      wrap.className = "filter-item";
      wrap.innerHTML = `
        <input type="checkbox" value="${cat}" id="${id}" />
        <div>
          <div style="font-weight:600;">${cat}</div>
        </div>`;
      filterGroup.appendChild(wrap);
    });

    openBtn.addEventListener("click", (e) => {
      e.stopPropagation(); 
      openSidebar();
    });

    document.addEventListener("click", (e) => {
      const clickInsideSidebar =
        sidebar.contains(e.target) || openBtn.contains(e.target);
      if (!clickInsideSidebar) {
        closeSidebar();
      }
    });

    btnSelectAll.addEventListener("click", () => {
      filterGroup
        .querySelectorAll('input[type="checkbox"]')
        .forEach((cb) => (cb.checked = true));
      renderChips();
    });
    btnClear.addEventListener("click", () => {
      filterGroup
        .querySelectorAll('input[type="checkbox"]')
        .forEach((cb) => (cb.checked = false));
      renderChips();
    });

    filterGroup.addEventListener("change", renderChips);

    applyFilter.addEventListener("click", () => {
      const selected = getSelected();
      window.dispatchEvent(
        new CustomEvent("categoryFilterChanged", { detail: { selected } })
      );
      closeSidebar();  
    });

    resetView.addEventListener("click", () => {
      filterGroup
        .querySelectorAll('input[type="checkbox"]')
        .forEach((cb) => (cb.checked = false));
      renderChips();
      window.dispatchEvent(
        new CustomEvent("categoryFilterChanged", { detail: { selected: [] } })
      );
      closeSidebar();
    });

    function getSelected() {
      return Array.from(
        filterGroup.querySelectorAll('input[type="checkbox"]:checked')
      ).map((cb) => cb.value);
    }
    function renderChips() {
      const selected = getSelected();
      activeChips.innerHTML = "";
      selected.forEach((cat) => {
        const el = document.createElement("span");
        el.className = "chip";
        el.textContent = cat;
        activeChips.appendChild(el);
      });
    }
  }
})();
