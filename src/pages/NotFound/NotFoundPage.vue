<template>
  <section class="min-h-screen w-full bg-gradient-to-br from-[var(--color-background)] to-[var(--color-surface)] px-4 py-8 sm:px-6 lg:px-8">
    <div class="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
      <!-- Contenedor principal con animación de entrada -->
      <div 
        class="relative w-full rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]/60 p-6 text-center shadow-xl backdrop-blur-sm transition-all duration-500 hover:shadow-2xl md:p-10 lg:p-12"
        :class="{ 'animate-fade-in-up': isVisible }"
      >
        
        <!-- Elementos decorativos flotantes -->
        <div class="absolute -top-3 -right-3 h-24 w-24 rounded-full bg-[var(--color-primary)]/5 blur-2xl" />
        <div class="absolute -bottom-3 -left-3 h-32 w-32 rounded-full bg-[var(--color-primary)]/5 blur-2xl" />

        <!-- Ícono animado -->
        <div class="mb-8 mt-6 flex justify-center">
          <div class="relative">
            <div class="absolute inset-0 animate-ping-slow rounded-full bg-[var(--color-primary)]/20" />
            <div class="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-primary)]/5 text-[var(--color-primary)] shadow-lg transition-all duration-300 hover:scale-105">
              <v-icon size="64" color="primary" class="animate-float">mdi-finance</v-icon>
            </div>
          </div>
        </div>

        <!-- Badge 404 animado -->
        <div class="mb-5 inline-block animate-pulse-subtle rounded-full bg-[var(--color-primary)]/10 px-5 py-1.5 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)] backdrop-blur-sm">
          Error 404
        </div>

        <!-- Título principal con gradiente -->
        <h1 class="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] bg-clip-text text-4xl font-extrabold tracking-tight text-transparent md:text-5xl lg:text-6xl">
          Página no encontrada
        </h1>

        <!-- Descripción con mejor spacing -->
        <div class="mt-6 space-y-2">
          <p class="mx-auto max-w-2xl text-base text-[var(--color-text)]/80 md:text-lg">
            Lo sentimos, no pudimos encontrar la página que estás buscando.
          </p>
          <p class="mx-auto max-w-md text-sm text-[var(--color-text)]/50">
            Es posible que el enlace esté roto o la página haya sido eliminada.
          </p>
        </div>

        <!-- Acciones principales con mejor espaciado -->
        <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <v-btn
            color="primary"
            size="large"
            variant="flat"
            prepend-icon="mdi-view-dashboard"
            @click="goDashboard"
            class="btn-primary-gradient min-w-[200px] px-6"
            :class="{ 'animate-shake': isHovering }"
            @mouseenter="isHovering = true"
            @mouseleave="isHovering = false"
          >
            Ir al dashboard
          </v-btn>

          <v-btn
            size="large"
            variant="outlined"
            prepend-icon="mdi-arrow-left"
            @click="goBack"
            class="btn-outline-custom min-w-[160px] px-6"
          >
            Volver atrás
          </v-btn>
        </div>

        <!-- Acciones secundarias -->
        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <v-btn
            variant="text"
            size="small"
            prepend-icon="mdi-home"
            @click="goDashboard"
            class="text-[var(--color-text)]/60"
          >
            Inicio
          </v-btn>
          
          <span class="text-[var(--color-text)]/20">•</span>
          
          <v-btn
            variant="text"
            size="small"
            prepend-icon="mdi-chart-line"
            @click="goDashboard"
            class="text-[var(--color-text)]/60"
          >
            Mis finanzas
          </v-btn>
          
          <span class="text-[var(--color-text)]/20">•</span>
          
          <v-btn
            variant="text"
            size="small"
            prepend-icon="mdi-history"
            @click="goBack"
            class="text-[var(--color-text)]/60"
          >
            Historial
          </v-btn>
        </div>

        <!-- Enlace de soporte mejorado -->
        <div class="mt-10 border-t border-[var(--color-border)] pt-6">
          <p class="text-xs text-[var(--color-text)]/40">
            ¿Necesitas ayuda financiera?
            <a 
              href="/soporte" 
              class="group inline-flex items-center gap-1 text-[var(--color-primary)] underline transition-all duration-300 hover:gap-2 hover:text-[var(--color-primary)]/80"
            >
              Contacta con soporte
              <v-icon size="14" class="transition-transform group-hover:translate-x-0.5">mdi-arrow-right</v-icon>
            </a>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isVisible = ref(false)
const isHovering = ref(false)

const goDashboard = () => {
  router.push('/dashboard')
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  // Activar animación después del montaje
  setTimeout(() => {
    isVisible.value = true
  }, 100)
})
</script>

<style scoped>
/* Animaciones personalizadas */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pingSlow {
  0% {
    transform: scale(1);
    opacity: 0.2;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

@keyframes pulseSubtle {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-ping-slow {
  animation: pingSlow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.animate-pulse-subtle {
  animation: pulseSubtle 2s ease-in-out infinite;
}

.animate-shake {
  animation: shake 0.3s ease-in-out;
}

/* Estilos personalizados para botones */
.btn-primary-gradient {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(var(--color-primary-rgb), 0.2);
}

.btn-primary-gradient:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(var(--color-primary-rgb), 0.3);
}

.btn-outline-custom {
  border: 1px solid var(--color-border);
  background: transparent;
  transition: all 0.3s ease;
}

.btn-outline-custom:hover {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.05);
  transform: translateY(-2px);
}

/* Mejoras de accesibilidad y responsive */
@media (max-width: 640px) {
  .animate-float {
    animation-duration: 2s;
  }
  
  .btn-primary-gradient,
  .btn-outline-custom {
    width: 100%;
  }
}

/* Efecto de glassmorphism mejorado */
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
}

/* Scroll suave para la página */
html {
  scroll-behavior: smooth;
}
</style>