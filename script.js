/**
 * MapleStory Accuracy Calculator
 */

// Main class to handle the calculator functionality
class MapleAccuracyCalculator {
  constructor() {
    this.loadedjson = null;
    this.initEventListeners();
    this.initThemeToggle();
  }

  // Initialize theme toggle functionality
  initThemeToggle() {
    // Create theme toggle button
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-switch';
    themeToggle.innerHTML = '🌓';
    themeToggle.setAttribute('aria-label', 'Toggle dark/light mode');
    document.body.appendChild(themeToggle);
    
    // Add event listener
    themeToggle.addEventListener('click', () => {
      const html = document.documentElement;
      if (html.getAttribute('data-theme') === 'dark') {
        html.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
      } else {
        html.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      }
    });
    
    // Check for saved theme preference or respect OS preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  // Initialize all event listeners
  initEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('search');
    
    searchInput.addEventListener('keyup', () => {
      const inp = searchInput.value.toLowerCase();
      const mobsDropdown = document.getElementById('mobs');
      const options = Array.from(mobsDropdown.querySelectorAll('.dropdown-option'));
      
      options.forEach(option => {
        option.style.display = '';
      });
      
      if (inp !== '') {
        options.forEach(option => {
          const level = option.dataset.mobLevel.toString();
          const name = option.dataset.mobName.toLowerCase();
          if (!name.includes(inp) && level !== inp) {
            option.style.display = 'none';
          }
        });
      }
    });

    // Add event listeners for buttons
    const buttons = {
      'sortByLevel': () => this.sortByLevel(),
      'sortByName': () => this.sortByName(),
    };

    Object.entries(buttons).forEach(([id, callback]) => {
      const button = document.getElementById(id);
      button.addEventListener('click', callback);
    });
    
    // Highlight the default sort button (sortByLevel)
    document.getElementById('sortByLevel').classList.add('active');

    // Add event listener for damage type radio group
    const damageTypeRadios = document.querySelector('.damage-type');
    damageTypeRadios.addEventListener('change', (event) => {
      if (event.target.type === 'radio') {
        this.dmgType(event.target.value);
        // Auto-calculate when damage type changes
        this.calculateAcc();
      }
    });

    // Add event listeners for input fields to auto-calculate
    const inputFields = ['level', 'mainstat', 'luk'];
    inputFields.forEach(fieldId => {
      const inputElement = document.getElementById(fieldId);
      inputElement.addEventListener('input', () => {
        this.calculateAcc();
      });
    });
  }
  
  // Initialize custom dropdowns
  initCustomDropdowns() {
    // Setup area dropdown
    const areasDropdown = document.getElementById('areas');
    const areasSelectedOption = areasDropdown.querySelector('.selected-option');
    const areasOptions = areasDropdown.querySelectorAll('.dropdown-option');
    
    // Toggle dropdown on click
    areasSelectedOption.addEventListener('click', () => {
      areasDropdown.classList.toggle('open');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!areasDropdown.contains(e.target)) {
        areasDropdown.classList.remove('open');
      }
    });
    
    // Handle option selection
    areasOptions.forEach(option => {
      option.addEventListener('click', () => {
        const value = option.getAttribute('data-value');
        areasSelectedOption.textContent = option.textContent;
        areasSelectedOption.setAttribute('data-value', value);
        areasDropdown.classList.remove('open');
        
        // Trigger area selection
        this.areaSelect(value);
        
        // Re-apply search filter if there's text in the search box
        const searchInput = document.getElementById('search');
        if (searchInput.value.trim() !== '') {
          // We need to wait for the monsters to load before applying the filter
          setTimeout(() => {
            const event = new Event('keyup');
            searchInput.dispatchEvent(event);
          }, 300); // Small delay to ensure monsters are loaded
        }
      });
    });
    
    // Setup monster dropdown (mobs is a list, not a dropdown with a selected option)
    const mobsDropdown = document.getElementById('mobs');
    const mobsOptions = mobsDropdown.querySelectorAll('.dropdown-option');
    
    // Handle monster selection
    mobsOptions.forEach(option => {
      option.addEventListener('click', () => {
        // Remove selected class from all options
        mobsDropdown.querySelectorAll('.dropdown-option').forEach(opt => {
          opt.classList.remove('selected');
        });
        
        // Add selected class to clicked option
        option.classList.add('selected');
        
        // Trigger mob selection
        const value = option.getAttribute('data-value');
        this.mobSelect(value);
      });
    });
  }

  // Clear the form and reset all fields
  clearForm() {
    document.forms.calc.reset();
    document.getElementById("luk").disabled = true;
    document.getElementById("luk").parentElement.style.visibility = 'hidden';
    document.getElementById("dmgType").innerHTML = 'ACC';
    document.getElementById("liblink").href = '';
    document.getElementById("mobPic").src = '';
    document.getElementById('HP').innerHTML = '-';
    document.getElementById('EXP').innerHTML = '-';
    document.getElementById('weak').innerHTML = '-';
    document.getElementById('strong').innerHTML = '-';
    document.getElementById('immune').innerHTML = '-';
    
    const mobsDropdown = document.getElementById('mobs');
    const mobsOptionsList = mobsDropdown.querySelector('.dropdown-options');
    mobsOptionsList.innerHTML = '<div class="dropdown-option" data-value="null">Select a area first</div>';
    
    // Add click event to the default option
    const defaultOption = mobsOptionsList.querySelector('.dropdown-option');
    defaultOption.addEventListener('click', () => {
      // Trigger mob selection with null value
      this.mobSelect('null');
    });
    
    // Reset area dropdown selected option
    const areasDropdown = document.getElementById('areas');
    const areasSelectedOption = areasDropdown.querySelector('.selected-option');
    areasSelectedOption.textContent = 'All Worlds';
    areasSelectedOption.setAttribute('data-value', 'all');
    
    // Clear result fields
    document.getElementById('mob1acc').innerHTML = '-';
    document.getElementById('mob100acc').innerHTML = '-';
    document.getElementById('mobRate').innerHTML = '-';
    
    // Show placeholder and hide content
    document.getElementById('monster-placeholder').style.display = 'flex';
    document.getElementById('monster-content').style.display = 'none';
  }

  // Check which elements are active in the array
  elementChecker(array) {
    const elements = [];
    
    if (array[0]) elements.push('Ice');
    if (array[1]) elements.push('Lightning');
    if (array[2]) elements.push('Fire');
    if (array[3]) elements.push('Poison');
    if (array[4]) elements.push('Holy');
    
    return elements.length > 0 ? elements : ['-'];
  }

  // Set damage type and enable/disable LUK field
  dmgType(type) {
    const lukContainer = document.getElementById("secondary-prop");
    
    if (type !== 'physical') {
      document.getElementById("luk").disabled = false;
      lukContainer.style.visibility = 'visible';
      document.getElementById("dmgType").innerHTML = 'INT';
    } else {
      document.getElementById("luk").disabled = true;
      lukContainer.style.visibility = 'hidden';
      document.getElementById("dmgType").innerHTML = 'ACC';
    }
  }

  // Load monster data for the selected world
  areaSelect(area) {
    const xhr = new XMLHttpRequest();
    xhr.overrideMimeType("application/json");
    xhr.open('GET', `Monsters/${area}.json`, true);
    
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200 || xhr.status === 0) { // 0 for local files
          try {
            const data = JSON.parse(xhr.responseText);
            this.loadedjson = data;
            
            // Sort the data by level by default (without creating DOM elements first)
            this.sortByLevel();
          } catch (error) {
            console.error('Error parsing JSON data:', error);
          }
        } else {
          console.error('Error loading monster data. Status:', xhr.status);
        }
      }
    };
    
    xhr.send(null);
  }

  // Display selected mob information
  mobSelect(mob) {
    if (mob !== "null" && this.loadedjson) {
      const mobData = this.loadedjson[mob];
      
      // Hide placeholder and show content
      document.getElementById('monster-placeholder').style.display = 'none';
      document.getElementById('monster-content').style.display = 'flex';

      // Update monster image and details directly without animation
      const mobPic = document.getElementById('mobPic');
      mobPic.src = `images/${mobData.id}.png`;
      document.getElementById('mobLevel').innerHTML = mobData.level;
      document.getElementById('mobAvoid').innerHTML = mobData.avoid;
      document.getElementById('HP').innerHTML = mobData.hp;
      document.getElementById('EXP').innerHTML = mobData.exp;
      document.getElementById('liblink').href = `https://maplelegends.com/lib/monster?id=${mobData.id}`;
      document.getElementById('weak').innerHTML = this.elementChecker(mobData.weak).join(', ');
      document.getElementById('strong').innerHTML = this.elementChecker(mobData.strong).join(', ');
      document.getElementById('immune').innerHTML = this.elementChecker(mobData.immune).join(', ');
      
      // Auto-calculate when a monster is selected
      this.calculateAcc();
    } else {
      // Show placeholder and hide content if no valid monster is selected
      document.getElementById('monster-placeholder').style.display = 'flex';
      document.getElementById('monster-content').style.display = 'none';
    }
  }

  // Sort monsters by level
  sortByLevel() {
    if (!this.loadedjson) return;
    
    // Update active sort button
    document.getElementById('sortByLevel').classList.add('active');
    document.getElementById('sortByName').classList.remove('active');
    
    const mobsDropdown = document.getElementById('mobs');
    const mobsOptionsList = mobsDropdown.querySelector('.dropdown-options');
    mobsOptionsList.innerHTML = '';
    
    // Sort the data by level directly
    const sortedEntries = Object.entries(this.loadedjson).sort((a, b) => {
      return a[1].level - b[1].level;
    });
    
    // Create DOM elements after sorting
    sortedEntries.forEach(([key, value]) => {
      const option = document.createElement('div');
      option.className = 'dropdown-option';
      option.dataset.value = key;
      option.dataset.mobName = key;
      option.dataset.mobLevel = value.level;
      option.innerHTML = `<div class="mob-option-flex"><div class="mob-level">Lv.${value.level}</div><div class="mob-name">${key}</div></div>`;
      
      // Add click event to each option
      option.addEventListener('click', () => {
        // Remove selected class from all options
        mobsDropdown.querySelectorAll('.dropdown-option').forEach(opt => {
          opt.classList.remove('selected');
        });
        
        // Add selected class to clicked option
        option.classList.add('selected');
        
        // Trigger mob selection
        this.mobSelect(key);
      });
      
      mobsOptionsList.appendChild(option);
    });
  }

  // Sort monsters alphabetically
  sortByName() {
    if (!this.loadedjson) return;
    
    // Update active sort button
    document.getElementById('sortByName').classList.add('active');
    document.getElementById('sortByLevel').classList.remove('active');
    
    const mobsDropdown = document.getElementById('mobs');
    const mobsOptionsList = mobsDropdown.querySelector('.dropdown-options');
    mobsOptionsList.innerHTML = '';
    
    // Sort the data by name directly
    const sortedEntries = Object.entries(this.loadedjson).sort((a, b) => {
      return a[0].localeCompare(b[0]);
    });
    
    // Create DOM elements after sorting
    sortedEntries.forEach(([key, value]) => {
      const option = document.createElement('div');
      option.className = 'dropdown-option';
      option.dataset.value = key;
      option.dataset.mobName = key;
      option.dataset.mobLevel = value.level;
      option.innerHTML = `<div class="mob-option-flex"><div class="mob-level">Lv.${value.level}</div><div class="mob-name">${key}</div></div>`;
      
      // Add click event to each option
      option.addEventListener('click', () => {
        // Remove selected class from all options
        mobsDropdown.querySelectorAll('.dropdown-option').forEach(opt => {
          opt.classList.remove('selected');
        });
        
        // Add selected class to clicked option
        option.classList.add('selected');
        
        // Trigger mob selection
        this.mobSelect(key);
      });
      
      mobsOptionsList.appendChild(option);
    });
  }

  // Calculate accuracy and hit rate
  calculateAcc() {
    // Check if monster is selected
    if (document.getElementById('monster-content').style.display === 'none') {
      return;
    }
    
    const monLevel = parseInt(document.getElementById('mobLevel').innerHTML);
    const monAvoid = parseInt(document.getElementById('mobAvoid').innerHTML);
    const charLevel = parseInt(document.getElementById('level').value);
    const charMainStat = parseInt(document.getElementById('mainstat').value);
    const charLuk = parseInt(document.getElementById('luk').value);
    
    // Validate inputs
    if (isNaN(monLevel) || isNaN(monAvoid)) {
      return;
    }
    
    if (isNaN(charLevel) || isNaN(charMainStat) || 
        (document.querySelector('input[name="damage-type"]:checked').value === 'magical' && isNaN(charLuk))) {
      return;
    }
    
    let diff = monLevel - charLevel;
    let acc100 = 0;
    let acc1 = 0;
    let accRatio = 0;
    
    if (diff < 0) diff = 0;
    
    if (document.querySelector('input[name="damage-type"]:checked').value === 'physical') {
      acc100 = (55.2 + 2.15 * diff) * (monAvoid / 15.0);
      acc1 = acc100 * 0.5 + 1;
      accRatio = 100 * ((charMainStat - (acc100 * 0.5)) / (acc100 * 0.5));
    } else {
      const curAcc = (Math.floor(charMainStat / 10) + Math.floor(charLuk / 10));
      acc100 = Math.floor((monAvoid + 1.0) * (1.0 + (0.04 * diff)));
      acc1 = Math.round(0.41 * acc100);
      const accPart = (curAcc - acc1 + 1) / (acc100 - acc1 + 1);
      accRatio = ((-0.7011618132 * Math.pow(accPart, 2)) + (1.702139835 * accPart)) * 100;
    }
    
    if (accRatio > 100) {
      accRatio = 100;
    } else if (accRatio < 0) {
      accRatio = 0;
    }
    
    document.getElementById('mob1acc').innerHTML = acc1.toPrecision(3);
    document.getElementById('mob100acc').innerHTML = acc100.toPrecision(3);
    document.getElementById('mobRate').innerHTML = `${accRatio.toPrecision(3)}%`;
  }
}

// Initialize the calculator when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const calculator = new MapleAccuracyCalculator();
  
  // Initialize the custom dropdowns after the DOM is fully loaded
  calculator.initCustomDropdowns();
  
  calculator.clearForm(); // Initialize the form
  
  // Load the default area (All Worlds) when the page opens
  calculator.areaSelect('all');
});
