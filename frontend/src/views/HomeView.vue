<template>
  <div class="home-view">
    <!-- Fondo decorativo mejorado -->
    <div class="background-pattern"></div>
    <div class="mountains"></div>
    <div class="particles">
      <div v-for="i in 20" :key="i" class="particle" :style="getParticleStyle()"></div>
    </div>
    
    <div class="hero">
      <div class="title-container">
        <div class="title-glow"></div>
        <h1 class="title">
          <span class="title-main">
            <span class="title-letter" v-for="(letter, index) in 'CodeShyri'.split('')" :key="index" :style="{ animationDelay: `${index * 0.1}s` }">
              {{ letter === ' ' ? '\u00A0' : letter }}
            </span>
          </span>
          <span class="title-subtitle">Shyri-Code</span>
        </h1>
        <p class="subtitle">Domina la programación en el mundo de los Kitus</p>
      </div>
      
      <div class="characters-preview">
        <div 
          class="character-card"
          :data-race="characters[0].race"
          :data-faction="characters[0].faction"
          @click="startGame(characters[0].id)"
          @mouseenter="hoveredCard = characters[0].id"
          @mouseleave="hoveredCard = null"
        >
          <div class="card-glow"></div>
          <div class="card-shine"></div>
          <div class="card-corner-decoration top-left"></div>
          <div class="card-corner-decoration top-right"></div>
          <div class="card-corner-decoration bottom-left"></div>
          <div class="card-corner-decoration bottom-right"></div>
          
          <div class="character-header">
            <div class="faction-label">
              <span class="faction-icon">🌿</span>
              <span class="faction-text">Pachamama</span>
            </div>
          </div>

          <div class="character-icon-wrapper">
            <div class="icon-background"></div>
            <div class="character-icon">{{ characters[0].icon }}</div>
            <div class="icon-ring"></div>
            <div class="icon-particles">
              <div v-for="i in 8" :key="i" class="particle-dot" :style="getParticleDotStyle(i)"></div>
            </div>
          </div>

          <div class="character-info">
            <div class="character-name-wrapper">
              <h3>{{ characters[0].name }}</h3>
              <div class="name-underline"></div>
            </div>
            <p class="character-description">{{ characters[0].description }}</p>
            <div class="character-stats">
              <div class="stat-item">
                <span class="stat-icon">🌾</span>
                <span class="stat-label">Cultivador</span>
              </div>
              <span class="stat-separator">•</span>
              <div class="stat-item">
                <span class="stat-icon">⛰️</span>
                <span class="stat-label">Andino</span>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="footer-divider"></div>
            <div class="select-hint">
              <span class="hint-text">Comenzar Aventura</span>
              <span class="hint-arrow">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()
const hoveredCard = ref<string | null>(null)

const characters = ref([
  {
    id: 'human-paladin',
    name: 'Paladín Humano',
    icon: '⚔️',
    description: 'Un noble paladín de la Alianza, maestro del honor y la justicia',
    color: '#4A90E2',
    race: 'human',
    faction: 'alliance'
  }
])

const startGame = (characterId?: string) => {
  router.push({ 
    name: 'Game', 
    params: { levelId: '1' },
    query: characterId ? { character: characterId } : {}
  })
}

const getParticleStyle = () => {
  const size = Math.random() * 4 + 2
  const left = Math.random() * 100
  const delay = Math.random() * 5
  const duration = Math.random() * 3 + 2
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}

const getParticleDotStyle = (index: number) => {
  return {
    animationDelay: `${index * 0.15}s`
  }
}
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  position: relative;
  overflow: hidden;
  background: 
    linear-gradient(180deg, #1a2e3d 0%, #2d1a3d 30%, #1a2e3d 70%, #0f1a24 100%),
    radial-gradient(circle at 50% 50%, rgba(139, 195, 74, 0.15) 0%, transparent 70%),
    radial-gradient(circle at 20% 30%, rgba(76, 175, 80, 0.1) 0%, transparent 50%);
}

.background-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(139, 195, 74, 0.15) 0%, transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(76, 175, 80, 0.12) 0%, transparent 40%),
    radial-gradient(circle at 50% 50%, rgba(175, 139, 199, 0.1) 0%, transparent 50%),
    repeating-linear-gradient(45deg, transparent, transparent 50px, rgba(76, 175, 80, 0.03) 50px, rgba(76, 175, 80, 0.03) 100px);
  animation: pulse 10s ease-in-out infinite;
  pointer-events: none;
}

.particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  background: rgba(139, 195, 74, 0.6);
  border-radius: 50%;
  animation: floatParticle 8s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(139, 195, 74, 0.5);
}

@keyframes floatParticle {
  0%, 100% {
    transform: translateY(100vh) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) translateX(50px);
    opacity: 0;
  }
}

.mountains {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 300px;
  background: linear-gradient(to top, #2d1a4a 0%, #3d2a4a 30%, transparent 100%);
  clip-path: polygon(0 100%, 0 75%, 12% 80%, 25% 65%, 38% 75%, 50% 60%, 62% 70%, 75% 55%, 88% 65%, 100% 70%, 100% 100%);
  opacity: 0.8;
  box-shadow: inset 0 -80px 150px rgba(45, 74, 45, 0.6);
}

.hero {
  text-align: center;
  max-width: 1200px;
  width: 100%;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  height: 100%;
}

.title-container {
  position: relative;
  margin-bottom: 0;
  margin-top: 0;
  cursor: default;
  animation: fadeInDown 1s ease-out;
}

.title-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120%;
  height: 120%;
  background: radial-gradient(circle, rgba(139, 195, 74, 0.25) 0%, rgba(76, 175, 80, 0.15) 50%, transparent 70%);
  animation: pulseGlow 3s ease-in-out infinite;
  pointer-events: none;
}

.title {
  position: relative;
  z-index: 2;
}

.title-main {
  display: inline-block;
  font-family: 'Cinzel', 'Uncial Antiqua', serif;
  font-size: clamp(2.5rem, 6vw, 5rem);
  font-weight: 900;
  background: linear-gradient(135deg, #8bc34a 0%, #9ccc65 25%, #7cb342 50%, #689f38 75%, #558b2f 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200% 200%;
  animation: gradientShift 5s ease infinite;
  margin-bottom: 0.3rem;
  letter-spacing: 6px;
  text-transform: uppercase;
  position: relative;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.6));
  cursor: default;
  user-select: none;
}

.title-letter {
  display: inline-block;
  animation: letterPop 0.6s ease-out both;
  transition: transform 0.3s;
}

.title-letter:hover {
  transform: translateY(-5px) scale(1.1);
}

@keyframes letterPop {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes pulseGlow {
  0%, 100% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

.title-subtitle {
  display: block;
  font-family: 'Cinzel', serif;
  font-size: clamp(0.85rem, 1.5vw, 1.1rem);
  font-weight: 600;
  color: #b8a5d6;
  letter-spacing: 8px;
  text-transform: uppercase;
  margin-top: 0.5rem;
  text-shadow: 
    0 0 20px rgba(139, 195, 74, 0.6),
    0 0 40px rgba(76, 175, 80, 0.3),
    2px 2px 4px rgba(0, 0, 0, 0.8);
  cursor: default;
  user-select: none;
  animation: fadeInUp 1.2s ease-out 0.3s both;
}

.subtitle {
  font-size: clamp(0.85rem, 1.2vw, 1rem);
  color: rgba(200, 184, 230, 0.95);
  margin-top: 0.8rem;
  font-weight: 400;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
  cursor: default;
  user-select: none;
  animation: fadeInUp 1.4s ease-out 0.5s both;
}

.characters-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 450px;
  animation: fadeInUp 1s ease-out 0.7s both;
}

.character-card {
  position: relative;
  background: 
    linear-gradient(135deg, rgba(29, 26, 61, 0.98) 0%, rgba(26, 26, 46, 0.98) 100%),
    repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(76, 175, 80, 0.1) 10px, rgba(76, 175, 80, 0.1) 20px);
  border-radius: 24px;
  padding: 2.5rem 2rem;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: none;
  overflow: hidden;
  backdrop-filter: blur(15px);
  width: 100%;
  max-width: 450px;
  box-shadow: 
    0 15px 50px rgba(0, 0, 0, 0.7),
    inset 0 0 40px rgba(139, 195, 74, 0.15),
    0 0 30px rgba(76, 175, 80, 0.4);
}

.character-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  padding: 4px;
  background-image: 
    url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%238bc34a' stroke-width='2' opacity='0.8'%3E%3Cpath d='M15 2 Q18 8 15 12 Q12 8 15 2'/%3E%3Cpath d='M2 15 Q8 18 12 15 Q8 12 2 15'/%3E%3Cpath d='M15 12 Q18 18 15 28 Q12 18 15 12'/%3E%3Cpath d='M28 15 Q22 18 18 15 Q22 12 28 15'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 30px 30px;
  background-repeat: repeat;
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  z-index: 1;
  transition: opacity 0.3s;
}

.character-card:hover::before {
  opacity: 1;
  background-image: 
    url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%238bc34a' stroke-width='2.5' opacity='1'%3E%3Cpath d='M15 2 Q18 8 15 12 Q12 8 15 2'/%3E%3Cpath d='M2 15 Q8 18 12 15 Q8 12 2 15'/%3E%3Cpath d='M15 12 Q18 18 15 28 Q12 18 15 12'/%3E%3Cpath d='M28 15 Q22 18 18 15 Q22 12 28 15'/%3E%3C/g%3E%3C/svg%3E");
}

.card-corner-decoration {
  position: absolute;
  width: 40px;
  height: 40px;
  border: none;
  opacity: 0.6;
  transition: all 0.4s;
  background-image: 
    url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%238bc34a' stroke-width='1.5' opacity='0.7'%3E%3Cpath d='M10 1 Q12 6 10 9 Q8 6 10 1'/%3E%3Cpath d='M1 10 Q6 12 9 10 Q6 8 1 10'/%3E%3Cpath d='M10 9 Q12 15 10 19 Q8 15 10 9'/%3E%3Cpath d='M19 10 Q14 12 11 10 Q14 8 19 10'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 20px 20px;
  background-repeat: no-repeat;
}

.card-corner-decoration.top-left {
  top: 10px;
  left: 10px;
  border-right: none;
  border-bottom: none;
  border-top-left-radius: 8px;
}

.card-corner-decoration.top-right {
  top: 10px;
  right: 10px;
  border-left: none;
  border-bottom: none;
  border-top-right-radius: 8px;
}

.card-corner-decoration.bottom-left {
  bottom: 10px;
  left: 10px;
  border-right: none;
  border-top: none;
  border-bottom-left-radius: 8px;
}

.card-corner-decoration.bottom-right {
  bottom: 10px;
  right: 10px;
  border-left: none;
  border-top: none;
  border-bottom-right-radius: 8px;
}

.character-card:hover .card-corner-decoration {
  opacity: 1;
  border-color: rgba(139, 195, 74, 0.9);
  transform: scale(1.1);
}

.character-header {
  position: relative;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: flex-end;
  z-index: 3;
}

.faction-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(139, 195, 74, 0.7);
  transition: all 0.3s;
  font-family: 'Cinzel', serif;
  position: relative;
  padding-right: 0.5rem;
}

.faction-label::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 12px;
  background: rgba(139, 195, 74, 0.4);
  transition: all 0.3s;
}

.character-card:hover .faction-label {
  color: rgba(139, 195, 74, 1);
  text-shadow: 0 0 8px rgba(139, 195, 74, 0.5);
}

.character-card:hover .faction-label::after {
  height: 16px;
  background: rgba(139, 195, 74, 0.7);
  box-shadow: 0 0 8px rgba(139, 195, 74, 0.5);
}

.faction-icon {
  font-size: 0.85rem;
  opacity: 0.7;
  transition: all 0.3s;
  filter: drop-shadow(0 0 3px rgba(139, 195, 74, 0.4));
}

.character-card:hover .faction-icon {
  opacity: 1;
  filter: drop-shadow(0 0 6px rgba(139, 195, 74, 0.6));
}

.faction-text {
  font-family: 'Cinzel', serif;
}

.character-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
  transition: left 0.6s;
}

.character-card:hover::before {
  left: 100%;
}

.character-card:hover {
  transform: translateY(-15px) scale(1.03);
  border-color: rgba(139, 195, 74, 0.9);
  box-shadow: 
    0 25px 80px rgba(139, 195, 74, 0.5),
    inset 0 0 60px rgba(139, 195, 74, 0.25),
    0 0 60px rgba(76, 175, 80, 0.7);
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(139, 195, 74, 0.3) 0%, rgba(76, 175, 80, 0.2) 50%, transparent 70%);
  opacity: 0;
  transition: opacity 0.5s;
  pointer-events: none;
}

.character-card:hover .card-glow {
  opacity: 1;
  animation: rotateGlow 4s linear infinite;
}

.card-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(from 0deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  opacity: 0;
  transition: opacity 0.5s;
  pointer-events: none;
}

.character-card:hover .card-shine {
  opacity: 1;
  animation: rotateShine 3s linear infinite;
}

@keyframes rotateGlow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes rotateShine {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.character-icon-wrapper {
  position: relative;
  margin-bottom: 1.5rem;
  display: inline-block;
  z-index: 2;
}

.icon-background {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140px;
  height: 140px;
  background: radial-gradient(circle, rgba(139, 195, 74, 0.15) 0%, transparent 70%);
  border-radius: 50%;
  opacity: 0.6;
  transition: all 0.4s;
  z-index: 0;
}

.character-card:hover .icon-background {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.2);
  background: radial-gradient(circle, rgba(139, 195, 74, 0.25) 0%, rgba(76, 175, 80, 0.15) 50%, transparent 70%);
}

.character-icon {
  font-size: 4.5rem;
  filter: drop-shadow(0 0 25px rgba(139, 195, 74, 0.7)) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.8));
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  z-index: 2;
  animation: iconFloat 4s ease-in-out infinite;
}

.character-card:hover .character-icon {
  transform: scale(1.15) rotate(10deg);
  filter: drop-shadow(0 0 40px rgba(139, 195, 74, 1)) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.8));
  animation: iconFloat 2s ease-in-out infinite, iconPulse 1.5s ease-in-out infinite;
}

@keyframes iconFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes iconPulse {
  0%, 100% {
    filter: drop-shadow(0 0 40px rgba(139, 195, 74, 1)) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.8));
  }
  50% {
    filter: drop-shadow(0 0 60px rgba(139, 195, 74, 1.2)) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.8));
  }
}

.icon-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90px;
  height: 90px;
  border: 3px solid rgba(139, 195, 74, 0.6);
  border-style: double;
  border-radius: 50%;
  animation: ringPulse 2s ease-in-out infinite;
  box-shadow: 0 0 30px rgba(139, 195, 74, 0.5);
}

.character-card:hover .icon-ring {
  animation: ringPulse 1s ease-in-out infinite, ringRotate 3s linear infinite;
  border-color: rgba(139, 195, 74, 0.9);
  box-shadow: 0 0 50px rgba(139, 195, 74, 0.8);
}

@keyframes ringPulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 1;
  }
}

@keyframes ringRotate {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

.icon-particles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.particle-dot {
  position: absolute;
  width: 6px;
  height: 6px;
  background: rgba(139, 195, 74, 0.8);
  border-radius: 50%;
  opacity: 0;
  box-shadow: 0 0 10px rgba(139, 195, 74, 0.8);
  top: 50%;
  left: 50%;
  margin-top: -3px;
  margin-left: -3px;
}

.character-card:hover .particle-dot {
  opacity: 1;
  animation: particleOrbit 3s ease-in-out infinite;
}

.particle-dot:nth-child(1) {
  animation-name: particleOrbit1;
}

.particle-dot:nth-child(2) {
  animation-name: particleOrbit2;
}

.particle-dot:nth-child(3) {
  animation-name: particleOrbit3;
}

.particle-dot:nth-child(4) {
  animation-name: particleOrbit4;
}

.particle-dot:nth-child(5) {
  animation-name: particleOrbit5;
}

.particle-dot:nth-child(6) {
  animation-name: particleOrbit6;
}

.particle-dot:nth-child(7) {
  animation-name: particleOrbit7;
}

.particle-dot:nth-child(8) {
  animation-name: particleOrbit8;
}

@keyframes particleOrbit1 {
  0%, 100% { transform: translate(0, -60px) scale(0.5); opacity: 0; }
  25%, 75% { opacity: 1; }
  50% { transform: translate(0, -60px) scale(1); opacity: 1; }
}

@keyframes particleOrbit2 {
  0%, 100% { transform: translate(42px, -42px) scale(0.5); opacity: 0; }
  25%, 75% { opacity: 1; }
  50% { transform: translate(42px, -42px) scale(1); opacity: 1; }
}

@keyframes particleOrbit3 {
  0%, 100% { transform: translate(60px, 0) scale(0.5); opacity: 0; }
  25%, 75% { opacity: 1; }
  50% { transform: translate(60px, 0) scale(1); opacity: 1; }
}

@keyframes particleOrbit4 {
  0%, 100% { transform: translate(42px, 42px) scale(0.5); opacity: 0; }
  25%, 75% { opacity: 1; }
  50% { transform: translate(42px, 42px) scale(1); opacity: 1; }
}

@keyframes particleOrbit5 {
  0%, 100% { transform: translate(0, 60px) scale(0.5); opacity: 0; }
  25%, 75% { opacity: 1; }
  50% { transform: translate(0, 60px) scale(1); opacity: 1; }
}

@keyframes particleOrbit6 {
  0%, 100% { transform: translate(-42px, 42px) scale(0.5); opacity: 0; }
  25%, 75% { opacity: 1; }
  50% { transform: translate(-42px, 42px) scale(1); opacity: 1; }
}

@keyframes particleOrbit7 {
  0%, 100% { transform: translate(-60px, 0) scale(0.5); opacity: 0; }
  25%, 75% { opacity: 1; }
  50% { transform: translate(-60px, 0) scale(1); opacity: 1; }
}

@keyframes particleOrbit8 {
  0%, 100% { transform: translate(-42px, -42px) scale(0.5); opacity: 0; }
  25%, 75% { opacity: 1; }
  50% { transform: translate(-42px, -42px) scale(1); opacity: 1; }
}

.character-info {
  position: relative;
  z-index: 2;
  width: 100%;
}

.character-name-wrapper {
  position: relative;
  margin-bottom: 1rem;
  display: inline-block;
  width: 100%;
}

.character-card h3 {
  font-family: 'Cinzel', serif;
  font-size: clamp(1.4rem, 2.5vw, 1.9rem);
  color: #8bc34a;
  margin-bottom: 0.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 4px;
  text-shadow: 
    0 0 15px rgba(139, 195, 74, 0.7),
    0 0 30px rgba(76, 175, 80, 0.4),
    2px 2px 4px rgba(0, 0, 0, 0.8);
  transition: all 0.3s;
  position: relative;
}

.name-underline {
  width: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #8bc34a, transparent);
  margin: 0 auto;
  transition: width 0.4s ease;
  box-shadow: 0 0 10px rgba(139, 195, 74, 0.6);
}

.character-card:hover .name-underline {
  width: 80%;
}

.character-card:hover h3 {
  transform: scale(1.05);
  text-shadow: 
    0 0 20px rgba(139, 195, 74, 1),
    0 0 40px rgba(76, 175, 80, 0.6),
    2px 2px 4px rgba(0, 0, 0, 0.8);
}

.character-description {
  color: rgba(200, 184, 230, 0.95);
  font-size: clamp(0.85rem, 1vw, 0.95rem);
  line-height: 1.7;
  font-weight: 400;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
  transition: all 0.3s;
  margin-bottom: 1.2rem;
  font-style: italic;
}

.character-card:hover .character-description {
  color: #c8b8e6;
  text-shadow: 0 2px 6px rgba(139, 195, 74, 0.8);
}

.character-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.8rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(200, 184, 230, 0.8);
  transition: all 0.3s;
}

.character-card:hover .stat-item {
  color: rgba(200, 184, 230, 1);
  text-shadow: 0 0 6px rgba(139, 195, 74, 0.5);
}

.stat-separator {
  color: rgba(139, 195, 74, 0.5);
  font-size: 0.9rem;
  transition: all 0.3s;
}

.character-card:hover .stat-separator {
  color: rgba(139, 195, 74, 0.7);
}

.stat-icon {
  font-size: 0.9rem;
  opacity: 0.8;
  transition: all 0.3s;
  filter: drop-shadow(0 0 3px rgba(139, 195, 74, 0.4));
}

.character-card:hover .stat-icon {
  opacity: 1;
  filter: drop-shadow(0 0 6px rgba(139, 195, 74, 0.6));
}

.stat-label {
  font-family: 'Cinzel', serif;
  letter-spacing: 1.5px;
  font-size: 0.7rem;
}

.card-footer {
  margin-top: 1.5rem;
  padding-top: 1.2rem;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
}

.footer-divider {
  width: 60%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(139, 195, 74, 0.4), transparent);
  transition: all 0.4s ease;
  position: relative;
}

.footer-divider::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: rgba(139, 195, 74, 0.4);
  border-radius: 50%;
  transition: all 0.4s ease;
}

.character-card:hover .footer-divider {
  width: 80%;
  background: linear-gradient(90deg, transparent, rgba(139, 195, 74, 0.7), transparent);
  box-shadow: 0 0 10px rgba(139, 195, 74, 0.5);
}

.character-card:hover .footer-divider::before {
  width: 12px;
  height: 12px;
  background: rgba(139, 195, 74, 0.9);
  box-shadow: 0 0 15px rgba(139, 195, 74, 0.7);
}

.select-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  color: rgba(200, 184, 230, 0.8);
  font-size: clamp(0.85rem, 1vw, 0.95rem);
  font-weight: 500;
  letter-spacing: 4px;
  transition: all 0.4s;
  text-transform: uppercase;
  font-family: 'Cinzel', serif;
  position: relative;
}

.select-hint::before {
  content: '';
  position: absolute;
  left: -10px;
  width: 4px;
  height: 4px;
  background: rgba(139, 195, 74, 0.6);
  border-radius: 50%;
  transition: all 0.4s ease;
  opacity: 0;
}

.select-hint::after {
  content: '';
  position: absolute;
  right: -10px;
  width: 4px;
  height: 4px;
  background: rgba(139, 195, 74, 0.6);
  border-radius: 50%;
  transition: all 0.4s ease;
  opacity: 0;
}

.character-card:hover .select-hint::before,
.character-card:hover .select-hint::after {
  opacity: 1;
  width: 6px;
  height: 6px;
  background: rgba(139, 195, 74, 0.9);
  box-shadow: 0 0 8px rgba(139, 195, 74, 0.7);
}

.hint-arrow {
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  font-size: 1.2em;
  display: inline-block;
  opacity: 0.8;
}

.character-card:hover .select-hint {
  color: rgba(200, 184, 230, 1);
  text-shadow: 0 0 10px rgba(139, 195, 74, 0.6);
  letter-spacing: 5px;
}

.character-card:hover .hint-arrow {
  transform: translateX(6px);
  opacity: 1;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .hero {
    gap: 3rem;
  }
  
  .title-main {
    letter-spacing: 4px;
  }
  
  .title-subtitle {
    letter-spacing: 6px;
  }
  
  .character-card {
    padding: 2.5rem 2rem;
  }
  
  .character-icon {
    font-size: 4.5rem;
  }
}
</style>
