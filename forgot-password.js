
// Validação do formulário de recuperação de senha com animações
document.addEventListener('DOMContentLoaded', function() {
  const emailForm = document.getElementById('emailForm');
  const verificationForm = document.getElementById('verificationForm');
  const newPasswordForm = document.getElementById('newPasswordForm');
  const emailInput = document.getElementById('email');
  const newPasswordInput = document.getElementById('newPassword');
  const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
  const toggleNewPassword = document.getElementById('toggleNewPassword');
  const passwordStrengthMeter = document.getElementById('password-strength-meter');
  const verificationInputs = document.querySelectorAll('.verification-input');
  const backToStep1 = document.getElementById('backToStep1');
  const backToStep2 = document.getElementById('backToStep2');
  const resendCodeBtn = document.getElementById('resendCode');
  const countdownEl = document.getElementById('countdown');
  
  // Adicionar animação aos elementos do formulário
  animateFormElements();
  
  // Mostrar partículas flutuantes
  initParticles();
  
  // Inicializar os passos
  showStep(1);
  
  // Função para validar email
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // Função para verificar força da senha
  function checkPasswordStrength(password) {
    let strength = 0;
    
    // Se a senha tem 8 ou mais caracteres
    if (password.length >= 8) {
      strength += 25;
    }
    
    // Se a senha tem letras minúsculas e maiúsculas
    if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) {
      strength += 25;
    }
    
    // Se a senha tem números
    if (password.match(/([0-9])/)) {
      strength += 25;
    }
    
    // Se a senha tem caracteres especiais
    if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) {
      strength += 25;
    }
    
    return strength;
  }
  
  // Atualizar medidor de força da senha
  if (newPasswordInput) {
    newPasswordInput.addEventListener('input', function() {
      const strength = checkPasswordStrength(this.value);
      passwordStrengthMeter.style.width = strength + '%';
      
      // Mudar a cor baseado na força
      if (strength < 25) {
        passwordStrengthMeter.className = 'progress-bar bg-danger';
      } else if (strength < 50) {
        passwordStrengthMeter.className = 'progress-bar bg-warning';
      } else if (strength < 75) {
        passwordStrengthMeter.className = 'progress-bar bg-info';
      } else {
        passwordStrengthMeter.className = 'progress-bar bg-success';
      }
      
      // Adicionar efeito de transição
      passwordStrengthMeter.style.transition = 'width 0.3s ease';
      
      // Verificar se a confirmação da senha corresponde
      if (confirmNewPasswordInput.value && confirmNewPasswordInput.value !== this.value) {
        confirmNewPasswordInput.classList.add('is-invalid');
      } else if (confirmNewPasswordInput.value) {
        confirmNewPasswordInput.classList.remove('is-invalid');
        confirmNewPasswordInput.classList.add('is-valid');
      }
    });
  }

  // Mostrar/ocultar senha
  if (toggleNewPassword) {
    toggleNewPassword.addEventListener('click', function() {
      const type = newPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      newPasswordInput.setAttribute('type', type);
      confirmNewPasswordInput.setAttribute('type', type);
      
      // Alterar ícone
      this.querySelector('i').classList.toggle('fa-eye');
      this.querySelector('i').classList.toggle('fa-eye-slash');
      
      // Adicionar efeito de pulso
      this.classList.add('pulse');
      setTimeout(() => this.classList.remove('pulse'), 300);
    });
  }
  
  // Gerenciar inputs do código de verificação
  verificationInputs.forEach((input, index) => {
    // Ao receber foco, selecionar todo o conteúdo
    input.addEventListener('focus', function() {
      this.select();
    });
    
    // Mover para o próximo input após digitar
    input.addEventListener('keyup', function(e) {
      if (this.value.length === 1) {
        if (index < verificationInputs.length - 1) {
          verificationInputs[index + 1].focus();
        }
      }
      
      // Permitir backspace para voltar ao campo anterior
      if (e.key === 'Backspace' && this.value.length === 0 && index > 0) {
        verificationInputs[index - 1].focus();
      }
      
      // Validar se todos os campos estão preenchidos
      verifyAllFieldsFilled();
    });
    
    // Adicionar efeito de foco
    input.addEventListener('focus', function() {
      this.classList.add('focused-input');
    });
    
    input.addEventListener('blur', function() {
      this.classList.remove('focused-input');
    });
  });
  
  // Verificar se todos os campos do código estão preenchidos
  function verifyAllFieldsFilled() {
    let allFilled = true;
    verificationInputs.forEach(input => {
      if (input.value.length === 0) {
        allFilled = false;
      }
    });
    
    if (allFilled) {
      document.querySelector('#verificationForm button[type="submit"]').classList.add('pulse-once');
      setTimeout(() => {
        document.querySelector('#verificationForm button[type="submit"]').classList.remove('pulse-once');
      }, 1000);
    }
  }
  
  // Iniciar countdown para o código de verificação
  let timeLeft = 300; // 5 minutos em segundos
  let countdownTimer;
  
  function startCountdown() {
    clearInterval(countdownTimer);
    timeLeft = 300;
    updateCountdown();
    
    countdownTimer = setInterval(() => {
      timeLeft--;
      updateCountdown();
      
      if (timeLeft <= 0) {
        clearInterval(countdownTimer);
        resendCodeBtn.classList.remove('disabled');
      }
    }, 1000);
  }
  
  function updateCountdown() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    countdownEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  
  // Funcionamento do botão "Reenviar código"
  resendCodeBtn.addEventListener('click', function() {
    if (!this.classList.contains('disabled')) {
      // Simulação de reenvio
      this.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
      
      setTimeout(() => {
        startCountdown();
        this.innerHTML = 'Reenviar código';
        this.classList.add('disabled');
        
        // Limpar campos
        verificationInputs.forEach(input => {
          input.value = '';
        });
        verificationInputs[0].focus();
        
        // Mostrar mensagem de sucesso
        showToast('Código reenviado com sucesso!', 'success');
      }, 1500);
    }
  });
  
  // Navegação entre os passos
  backToStep1.addEventListener('click', function() {
    showStep(1);
  });
  
  backToStep2.addEventListener('click', function() {
    showStep(2);
  });
  
  // Função para mostrar o passo e esconder os outros
  function showStep(step) {
    document.querySelectorAll('.recovery-step').forEach(el => {
      el.classList.remove('active');
    });
    
    document.getElementById(`step${step}`).classList.add('active');
    
    // Atualizar subtítulo
    const subtitle = document.getElementById('recovery-subtitle');
    if (step === 1) {
      subtitle.textContent = 'Informe seu email para receber um link de recuperação';
    } else if (step === 2) {
      subtitle.textContent = 'Digite o código de 6 dígitos enviado para seu email';
      startCountdown();
      setTimeout(() => {
        verificationInputs[0].focus();
      }, 300);
    } else if (step === 3) {
      subtitle.textContent = 'Crie uma nova senha segura para sua conta';
    }
    
    // Animar elementos do formulário
    animateFormElements();
  }
  
  // Lidar com o envio do formulário de email
  emailForm.addEventListener('submit', function(event) {
    event.preventDefault();
    
    if (!emailInput.value || !isValidEmail(emailInput.value)) {
      emailInput.classList.add('is-invalid');
      return;
    }
    
    emailInput.classList.remove('is-invalid');
    
    // Efeito de loading no botão
    const submitBtn = emailForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
    submitBtn.disabled = true;
    
    // Simular o envio
    setTimeout(() => {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      
      // Avançar para o próximo passo
      showStep(2);
      
      // Mostrar toast
      showToast(`Código enviado para ${emailInput.value}`, 'success');
    }, 1500);
  });
  
  // Lidar com o envio do formulário de verificação
  verificationForm.addEventListener('submit', function(event) {
    event.preventDefault();
    
    let code = '';
    let isValid = true;
    
    // Verificar se todos os campos estão preenchidos
    verificationInputs.forEach(input => {
      if (!input.value) {
        input.classList.add('is-invalid');
        isValid = false;
      } else {
        input.classList.remove('is-invalid');
        code += input.value;
      }
    });
    
    if (!isValid) return;
    
    // Efeito de loading no botão
    const submitBtn = verificationForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verificando...';
    submitBtn.disabled = true;
    
    // Simulação de verificação (usamos 123456 como código válido)
    setTimeout(() => {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      
      if (code === '123456') {
        // Avançar para o próximo passo
        showStep(3);
      } else {
        // Mostrar erro
        verificationInputs.forEach(input => {
          input.classList.add('is-invalid');
        });
        showToast('Código inválido. Tente novamente.', 'error');
      }
    }, 1500);
  });
  
  // Lidar com o envio do formulário de nova senha
  newPasswordForm.addEventListener('submit', function(event) {
    event.preventDefault();
    let isValid = true;
    
    // Validar nova senha
    if (!newPasswordInput.value || newPasswordInput.value.length < 8) {
      newPasswordInput.classList.add('is-invalid');
      isValid = false;
    } else {
      newPasswordInput.classList.remove('is-invalid');
      newPasswordInput.classList.add('is-valid');
    }
    
    // Validar confirmação de senha
    if (confirmNewPasswordInput.value !== newPasswordInput.value) {
      confirmNewPasswordInput.classList.add('is-invalid');
      isValid = false;
    } else if (confirmNewPasswordInput.value) {
      confirmNewPasswordInput.classList.remove('is-invalid');
      confirmNewPasswordInput.classList.add('is-valid');
    }
    
    if (!isValid) return;
    
    // Efeito de loading no botão
    const submitBtn = newPasswordForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Redefinindo...';
    submitBtn.disabled = true;
    
    // Simulação de envio
    setTimeout(() => {
      // Animar o card para simular uma transição
      document.querySelector('.card').classList.add('success-animation');
      
      setTimeout(() => {
        // Restaurar o botão
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Simular um sucesso com uma animação
        showSuccessMessage();
        
        // Limpar o formulário
        newPasswordForm.reset();
        document.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));
        document.querySelector('.card').classList.remove('success-animation');
        passwordStrengthMeter.style.width = '0%';
        passwordStrengthMeter.className = 'progress-bar';
      }, 1000);
    }, 1500);
  });
  
  // Limpar validação quando o usuário digita
  emailInput.addEventListener('input', function() {
    if (this.classList.contains('is-invalid')) {
      this.classList.remove('is-invalid');
    }
  });
  
  confirmNewPasswordInput.addEventListener('input', function() {
    if (this.value !== newPasswordInput.value) {
      this.classList.add('is-invalid');
    } else {
      this.classList.remove('is-invalid');
      this.classList.add('is-valid');
    }
  });
  
  // Função para mostrar um toast
  function showToast(message, type = 'info') {
    // Remover toasts existentes
    const existingToasts = document.querySelectorAll('.custom-toast');
    existingToasts.forEach(toast => {
      document.body.removeChild(toast);
    });
    
    // Criar novo toast
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.classList.add(`toast-${type}`);
    
    // Ícone baseado no tipo
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    
    toast.innerHTML = `
      <div class="toast-content">
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
      </div>
      <div class="toast-progress"></div>
    `;
    
    document.body.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => {
      toast.classList.add('show');
      
      // Iniciar barra de progresso
      const progress = toast.querySelector('.toast-progress');
      progress.style.width = '100%';
      progress.style.transition = 'width 4s linear';
      setTimeout(() => {
        progress.style.width = '0%';
      }, 100);
      
      // Remover após alguns segundos
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 4000);
    }, 10);
  }
  
  // Função para animar os elementos do formulário
  function animateFormElements() {
    const elements = document.querySelectorAll('.recovery-step.active *');
    elements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 100 + (index * 50));
    });
  }
  
  // Inicializar partículas
  function initParticles() {
    const particles = document.querySelectorAll('.particle');
    particles.forEach((particle, index) => {
      const size = Math.random() * 20 + 5;
      const duration = Math.random() * 15 + 10;
      const delay = Math.random() * 5;
      
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDuration = `${duration}s`;
      particle.style.animationDelay = `${delay}s`;
      particle.style.opacity = Math.random() * 0.5 + 0.1;
      
      // Cores aleatórias em tons de azul
      const hue = 220 + Math.random() * 40;
      const saturation = 70 + Math.random() * 30;
      const lightness = 70 + Math.random() * 20;
      particle.style.backgroundColor = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.6)`;
    });
  }
  
  // Mostrar mensagem de sucesso com animação
  function showSuccessMessage() {
    // Criar elemento de overlay
    const overlay = document.createElement('div');
    overlay.className = 'success-overlay';
    overlay.innerHTML = `
      <div class="success-message">
        <i class="fa-solid fa-circle-check fa-3x mb-3"></i>
        <h4>Senha redefinida com sucesso!</h4>
        <p>Redirecionando para o login...</p>
      </div>
    `;
    document.body.appendChild(overlay);
    
    // Animar entrada
    setTimeout(() => {
      overlay.style.opacity = '1';
    }, 10);
    
    // Redirecionar após alguns segundos
    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(overlay);
        window.location.href = 'index.html'; // Redirecionar para a página de login
      }, 500);
    }, 2000);
  }
  
  // Adicionar estilos para diversos elementos
  const style = document.createElement('style');
  style.textContent = `
    .recovery-step {
      display: none;
    }
    
    .recovery-step.active {
      display: block;
    }
    
    .verification-code-container {
      display: flex;
      justify-content: space-between;
      margin: 10px 0;
    }
    
    .verification-input {
      width: 45px;
      height: 50px;
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      margin: 0 4px;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      transition: all 0.3s ease;
    }
    
    .verification-input:focus {
      border-color: #4361ee;
      box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
      transform: translateY(-3px);
    }
    
    .verification-input.is-invalid {
      border-color: #dc3545;
      box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.15);
    }
    
    .focused-input {
      transform: scale(1.05);
    }
    
    .pulse-once {
      animation: pulse 1s;
    }
    
    .btn-link {
      color: #4361ee;
      text-decoration: none;
      transition: all 0.3s;
    }
    
    .btn-link:hover {
      color: #3a56d4;
      text-decoration: none;
    }
    
    .btn-with-icon {
      position: relative;
      overflow: hidden;
    }
    
    .btn-with-icon:after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 5px;
      height: 5px;
      background: rgba(255, 255, 255, 0.5);
      opacity: 0;
      border-radius: 100%;
      transform: scale(1, 1) translate(-50%);
      transform-origin: 50% 50%;
    }
    
    .btn-with-icon:hover:after {
      animation: ripple 1s;
    }
    
    @keyframes ripple {
      0% {
        transform: scale(0, 0);
        opacity: 0.5;
      }
      100% {
        transform: scale(20, 20);
        opacity: 0;
      }
    }
    
    .custom-toast {
      position: fixed;
      top: 20px;
      right: 20px;
      min-width: 250px;
      background-color: white;
      color: #333;
      padding: 0;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      z-index: 1050;
      overflow: hidden;
      transform: translateX(120%);
      transition: transform 0.3s ease;
    }
    
    .custom-toast.show {
      transform: translateX(0);
    }
    
    .toast-content {
      padding: 12px 15px;
      display: flex;
      align-items: center;
    }
    
    .toast-content i {
      margin-right: 10px;
      font-size: 18px;
    }
    
    .toast-progress {
      height: 4px;
      background-color: rgba(67, 97, 238, 0.6);
      width: 100%;
    }
    
    .toast-success .toast-progress {
      background-color: rgba(40, 167, 69, 0.6);
    }
    
    .toast-error .toast-progress {
      background-color: rgba(220, 53, 69, 0.6);
    }
    
    .toast-warning .toast-progress {
      background-color: rgba(255, 193, 7, 0.6);
    }
    
    .toast-success i {
      color: #28a745;
    }
    
    .toast-error i {
      color: #dc3545;
    }
    
    .toast-warning i {
      color: #ffc107;
    }
    
    .success-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.5s ease;
    }
    
    .success-message {
      background-color: white;
      padding: 30px 50px;
      border-radius: 10px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      animation: pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    
    .success-message i {
      color: #4CAF50;
    }
    
    @keyframes pop {
      0% { transform: scale(0.8); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    
    .rotate-icon {
      animation: rotateKey 10s infinite linear;
      transform-origin: center;
    }
    
    @keyframes rotateKey {
      0% { transform: rotate(0deg); }
      25% { transform: rotate(10deg); }
      50% { transform: rotate(0deg); }
      75% { transform: rotate(-10deg); }
      100% { transform: rotate(0deg); }
    }
    
    .forgot-password-bg {
      background: linear-gradient(135deg, #e9f0f8 0%, #d2e2f5 100%);
    }
    
    .floating-particles {
      position: fixed;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      z-index: 0;
      pointer-events: none;
    }
    
    .particle {
      position: absolute;
      border-radius: 50%;
      background-color: rgba(67, 97, 238, 0.2);
      animation: floatParticle linear infinite;
    }
    
    @keyframes floatParticle {
      0% {
        transform: translate(0, 0) rotate(0deg);
      }
      25% {
        transform: translate(20px, -30px) rotate(90deg);
      }
      50% {
        transform: translate(-20px, -50px) rotate(180deg);
      }
      75% {
        transform: translate(-40px, -20px) rotate(270deg);
      }
      100% {
        transform: translate(0, 0) rotate(360deg);
      }
    }
  `;
  document.head.appendChild(style);
});
