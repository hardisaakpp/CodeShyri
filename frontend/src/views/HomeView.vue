<template>
  <div class="home-view">
    <!-- Fondo decorativo -->
    <div class="background-pattern"></div>
    <div class="mountains"></div>
    
    <div class="hero">
      <div class="title-container">
        <h1 class="title">
          <span class="title-main">CodeShyri</span>
          <span class="title-subtitle">El Camino del Código Andino</span>
        </h1>
        <p class="subtitle">Domina la programación guiado por los dioses de los Andes</p>
      </div>
      
      <div class="characters-preview">
        <div 
          v-for="(character, index) in characters" 
          :key="character.id"
          class="character-card"
          :style="{ animationDelay: `${index * 0.1}s` }"
          @click="startGame(character.id)"
          @mouseenter="hoveredCard = character.id"
          @mouseleave="hoveredCard = null"
        >
          <div class="card-glow"></div>
          <div class="character-icon-wrapper">
            <div class="character-icon">{{ character.icon }}</div>
            <div class="icon-ring"></div>
          </div>
          <div class="character-info">
            <h3>{{ character.name }}</h3>
            <p>{{ character.description }}</p>
          </div>
          <div class="card-footer">
            <span class="select-hint">Seleccionar →</span>
          </div>
        </div>
      </div>

      <div class="action-section">
        <button class="start-button" @click="startGame()">
          <span class="button-text">Comenzar Aventura</span>
          <span class="button-glow"></span>
        </button>
        <div class="decorative-elements">
          <div class="decorative-line"></div>
          <span class="or-text">o selecciona un personaje</span>
          <div class="decorative-line"></div>
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
    id: 'viracocha',
    name: 'Viracocha',
    icon: '👑',
    description: 'El dios creador te guiará en tus primeros pasos',
    color: '#FFD700'
  },
  {
    id: 'inti',
    name: 'Inti',
    icon: '☀️',
    description: 'El dios del sol iluminará tu camino',
    color: '#FF6B35'
  },
  {
    id: 'pachamama',
    name: 'Pachamama',
    icon: '🌍',
    description: 'La madre tierra te protegerá',
    color: '#4ECDC4'
  },
  {
    id: 'amaru',
    name: 'Amaru',
    icon: '🐍',
    description: 'La serpiente sagrada te enseñará sabiduría',
    color: '#95E1D3'
  }
])

const startGame = (characterId?: string) => {
  router.push({ 
    name: 'Game', 
    params: { levelId: '1' },
    query: characterId ? { character: characterId } : {}
  })
}
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #0a0e27 0%, #1a1a2e 50%, #16213e 100%);
}

.background-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 107, 53, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 20%, rgba(78, 205, 196, 0.1) 0%, transparent 50%);
  animation: pulse 8s ease-in-out infinite;
  pointer-events: none;
}

.mountains {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(to top, #0f3460 0%, transparent 100%);
  clip-path: polygon(0 100%, 0 60%, 20% 70%, 40% 50%, 60% 65%, 80% 45%, 100% 55%, 100% 100%);
  opacity: 0.3;
}

.hero {
  text-align: center;
  max-width: 1400px;
  width: 100%;
  position: relative;
  z-index: 1;
}

.title-container {
  margin-bottom: 4rem;
  animation: float 6s ease-in-out infinite;
}

.title-main {
  display: block;
  font-family: 'Orbitron', sans-serif;
  font-size: 5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #FFD700 0%, #FF6B35 50%, #4ECDC4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 40px rgba(255, 215, 0, 0.5);
  margin-bottom: 0.5rem;
  letter-spacing: 4px;
  text-transform: uppercase;
}

.title-subtitle {
  display: block;
  font-family: 'Rajdhani', sans-serif;
  font-size: 1.2rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 8px;
  text-transform: uppercase;
  margin-top: 0.5rem;
}

.subtitle {
  font-size: 1.4rem;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 1rem;
  font-weight: 400;
  letter-spacing: 1px;
}

.characters-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2.5rem;
  margin-bottom: 4rem;
  padding: 0 1rem;
}

.character-card {
  position: relative;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%);
  border-radius: 20px;
  padding: 2.5rem 2rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 2px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  backdrop-filter: blur(10px);
  animation: fadeInUp 0.6s ease-out both;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.character-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s;
}

.character-card:hover::before {
  left: 100%;
}

.character-card:hover {
  transform: translateY(-10px) scale(1.02);
  border-color: rgba(255, 215, 0, 0.5);
  box-shadow: 0 20px 60px rgba(255, 215, 0, 0.3);
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s;
}

.character-card:hover .card-glow {
  opacity: 1;
}

.character-icon-wrapper {
  position: relative;
  margin-bottom: 1.5rem;
  display: inline-block;
}

.character-icon {
  font-size: 5rem;
  filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.5));
  transition: transform 0.3s;
  position: relative;
  z-index: 2;
}

.character-card:hover .character-icon {
  transform: scale(1.1) rotate(5deg);
  animation: float 3s ease-in-out infinite;
}

.icon-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border: 3px solid rgba(255, 215, 0, 0.3);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.character-info {
  position: relative;
  z-index: 2;
}

.character-card h3 {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.8rem;
  color: #FFD700;
  margin-bottom: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.character-card p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  line-height: 1.6;
  font-weight: 300;
}

.card-footer {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.select-hint {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 1px;
  transition: all 0.3s;
}

.character-card:hover .select-hint {
  color: #FFD700;
  transform: translateX(5px);
}

.action-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.start-button {
  position: relative;
  background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
  color: white;
  border: none;
  padding: 1.2rem 4rem;
  font-size: 1.3rem;
  font-weight: 700;
  font-family: 'Orbitron', sans-serif;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 10px 30px rgba(255, 107, 53, 0.4);
  text-transform: uppercase;
  letter-spacing: 2px;
  overflow: hidden;
}

.start-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.start-button:hover::before {
  left: 100%;
}

.start-button:hover {
  transform: scale(1.05) translateY(-2px);
  box-shadow: 0 15px 40px rgba(255, 107, 53, 0.6);
}

.start-button:active {
  transform: scale(0.98);
}

.button-text {
  position: relative;
  z-index: 1;
}

.button-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: width 0.5s, height 0.5s;
}

.start-button:hover .button-glow {
  width: 300px;
  height: 300px;
}

.decorative-elements {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  max-width: 500px;
}

.decorative-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.5), transparent);
}

.or-text {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
  font-weight: 300;
  letter-spacing: 2px;
  text-transform: uppercase;
}

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

@media (max-width: 768px) {
  .title-main {
    font-size: 3rem;
  }
  
  .characters-preview {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>

