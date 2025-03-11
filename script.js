
// Validação do formulário de login com animações
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const togglePassword = document.getElementById('togglePassword');
  
  // Adicionar animação aos elementos do formulário
  animateFormElements();
  
  // Função para validar email
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Mostrar/ocultar senha
  togglePassword.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Alterar ícone
    this.querySelector('i').classList.toggle('fa-eye');
    this.querySelector('i').classList.toggle('fa-eye-slash');
    
    // Adicionar efeito de pulso
    this.classList.add('pulse');
    setTimeout(() => this.classList.remove('pulse'), 300);
  });
  
  // Adicionar ouvinte de evento para envio do formulário
  loginForm.addEventListener('submit', function(event) {
    event.preventDefault();
    let isValid = true;
    
    // Validar email
    if (!emailInput.value || !isValidEmail(emailInput.value)) {
      emailInput.classList.add('is-invalid');
      isValid = false;
    } else {
      emailInput.classList.remove('is-invalid');
      emailInput.classList.add('is-valid');
    }
    
    // Validar senha
    if (!passwordInput.value) {
      passwordInput.classList.add('is-invalid');
      isValid = false;
    } else {
      passwordInput.classList.remove('is-invalid');
      passwordInput.classList.add('is-valid');
    }
    
    // Se o formulário for válido, enviar (simulação)
    if (isValid) {
      // Efeito de loading no botão
      const submitBtn = document.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Entrando...';
      submitBtn.disabled = true;
      
      // Em um caso real, você enviaria os dados para o servidor aqui
      console.log('Formulário enviado com sucesso!');
      console.log('Email:', emailInput.value);
      console.log('Manter conectado:', document.getElementById('stayLoggedIn').checked);
      
      // Salvar nome de usuário no localStorage (em uma aplicação real seria feito pelo backend)
      // Extraindo o nome do usuário a partir do email
      const userName = emailInput.value.split('@')[0];
      localStorage.setItem('usuarioNome', userName.charAt(0).toUpperCase() + userName.slice(1));
      
      // Simular um delay de processamento
      setTimeout(() => {
        // Animar o card para simular uma transição
        document.querySelector('.card').classList.add('success-animation');
        
        setTimeout(() => {
          // Restaurar o botão
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          
          // Simular um login bem-sucedido com uma animação suave
          showSuccessMessage();
          
          // Limpar o formulário
          loginForm.reset();
          document.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));
          document.querySelector('.card').classList.remove('success-animation');
          
          // Redirecionar para a página principal após o login
          setTimeout(() => {
            window.location.href = 'home.html';
          }, 1500);
        }, 1000);
      }, 1500);
    }
  });
  
  // Limpar validação quando o usuário digita
  emailInput.addEventListener('input', function() {
    if (this.classList.contains('is-invalid')) {
      this.classList.remove('is-invalid');
    }
  });
  
  passwordInput.addEventListener('input', function() {
    if (this.classList.contains('is-invalid')) {
      this.classList.remove('is-invalid');
    }
  });
  
  // Adicionar efeito de foco nos inputs
  document.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.classList.add('input-focused');
    });
    
    input.addEventListener('blur', function() {
      this.parentElement.classList.remove('input-focused');
    });
  });
  
  // Função para animar os elementos do formulário
  function animateFormElements() {
    const elements = document.querySelectorAll('.card *');
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
  
  // Mostrar mensagem de sucesso com animação
  function showSuccessMessage() {
    // Criar elemento de overlay
    const overlay = document.createElement('div');
    overlay.className = 'success-overlay';
    overlay.innerHTML = `
      <div class="success-message">
        <i class="fa-solid fa-circle-check fa-3x mb-3"></i>
        <h4>Login realizado com sucesso!</h4>
        <p>Redirecionando...</p>
      </div>
    `;
    document.body.appendChild(overlay);
    
    // Animar entrada
    setTimeout(() => {
      overlay.style.opacity = '1';
    }, 10);
    
    // Remover após alguns segundos
    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(overlay);
      }, 500);
    }, 2000);
  }
  
  // Adicionar estilos para a mensagem de sucesso
  const style = document.createElement('style');
  style.textContent = `
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
    
    .input-focused {
      transform: translateY(-3px);
    }
    
    .pulse {
      animation: pulse 0.3s;
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
    
    .success-animation {
      animation: successCard 1s;
    }
    
    @keyframes successCard {
      0% { transform: translateY(0); }
      50% { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(67, 97, 238, 0.3); }
      100% { transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
});
