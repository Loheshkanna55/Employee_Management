// Show current date in the sidebar
document.addEventListener('DOMContentLoaded', function() {
  // Set active nav link
  const currentLocation = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (currentLocation === linkPath || 
        (linkPath !== '/' && currentLocation.startsWith(linkPath))) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Dynamic form fields for salary allocation
  const addDeductionBtn = document.getElementById('addDeductionBtn');
  const deductionContainer = document.getElementById('deductionContainer');
  
  if (addDeductionBtn && deductionContainer) {
    addDeductionBtn.addEventListener('click', function() {
      const index = document.querySelectorAll('.deduction-row').length;
      
      const row = document.createElement('div');
      row.className = 'row deduction-row mb-3';
      row.innerHTML = `
        <div class="col-md-6">
          <input type="text" class="form-control" name="deductionReason[${index}]" placeholder="Reason" required>
        </div>
        <div class="col-md-5">
          <input type="number" step="0.01" class="form-control" name="deductionAmount[${index}]" placeholder="Amount" required>
        </div>
        <div class="col-md-1">
          <button type="button" class="btn btn-danger btn-sm remove-row">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;
      
      deductionContainer.appendChild(row);
      
      row.querySelector('.remove-row').addEventListener('click', function() {
        deductionContainer.removeChild(row);
      });
    });
  }
  
  const addBonusBtn = document.getElementById('addBonusBtn');
  const bonusContainer = document.getElementById('bonusContainer');
  
  if (addBonusBtn && bonusContainer) {
    addBonusBtn.addEventListener('click', function() {
      const index = document.querySelectorAll('.bonus-row').length;
      
      const row = document.createElement('div');
      row.className = 'row bonus-row mb-3';
      row.innerHTML = `
        <div class="col-md-6">
          <input type="text" class="form-control" name="bonusReason[${index}]" placeholder="Reason" required>
        </div>
        <div class="col-md-5">
          <input type="number" step="0.01" class="form-control" name="bonusAmount[${index}]" placeholder="Amount" required>
        </div>
        <div class="col-md-1">
          <button type="button" class="btn btn-danger btn-sm remove-row">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;
      
      bonusContainer.appendChild(row);
      
      row.querySelector('.remove-row').addEventListener('click', function() {
        bonusContainer.removeChild(row);
      });
    });
  }

  // Delete confirmation
  const deleteButtons = document.querySelectorAll('.btn-delete');
  
  deleteButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
        e.preventDefault();
      }
    });
  });

  // Salary calculation
  const baseSalaryInput = document.getElementById('baseSalary');
  const totalDeductionsSpan = document.getElementById('totalDeductions');
  const totalBonusesSpan = document.getElementById('totalBonuses');
  const netSalarySpan = document.getElementById('netSalary');
  
  if (baseSalaryInput && totalDeductionsSpan && totalBonusesSpan && netSalarySpan) {
    function calculateSalary() {
      let baseSalary = parseFloat(baseSalaryInput.value) || 0;
      
      // Calculate deductions
      let totalDeductions = 0;
      const deductionAmounts = document.querySelectorAll('input[name^="deductionAmount"]');
      deductionAmounts.forEach(input => {
        totalDeductions += parseFloat(input.value) || 0;
      });
      
      // Calculate bonuses
      let totalBonuses = 0;
      const bonusAmounts = document.querySelectorAll('input[name^="bonusAmount"]');
      bonusAmounts.forEach(input => {
        totalBonuses += parseFloat(input.value) || 0;
      });
      
      // Calculate net salary
      const netSalary = baseSalary - totalDeductions + totalBonuses;
      
      // Update display
      totalDeductionsSpan.textContent = totalDeductions.toFixed(2);
      totalBonusesSpan.textContent = totalBonuses.toFixed(2);
      netSalarySpan.textContent = netSalary.toFixed(2);
    }
    
    // Listen for input changes
    baseSalaryInput.addEventListener('input', calculateSalary);
    
    // Set up a mutation observer to watch for changes to the deduction and bonus containers
    const observer = new MutationObserver(calculateSalary);
    
    if (deductionContainer) {
      observer.observe(deductionContainer, { childList: true, subtree: true });
    }
    
    if (bonusContainer) {
      observer.observe(bonusContainer, { childList: true, subtree: true });
    }
    
    // Listen for input events on any deduction or bonus amount inputs
    document.addEventListener('input', function(e) {
      if (e.target.name && (e.target.name.startsWith('deductionAmount') || e.target.name.startsWith('bonusAmount'))) {
        calculateSalary();
      }
    });
    
    // Initial calculation
    calculateSalary();
  }
});