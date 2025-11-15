<template>
  <div class="home-view">
    <!-- Fondo decorativo -->
    <div class="background-pattern"></div>
    <div class="mountains"></div>
    
    <div class="hero">
      <div class="title-container">
        <h1 class="title">
          <span class="title-main">CodeShyri</span>
          <span class="title-subtitle">Azeroth del Código</span>
        </h1>
        <p class="subtitle">Domina la programación en el mundo de Warcraft</p>
      </div>
      
      <div class="characters-preview">
        <div 
          v-for="(character, index) in characters" 
          :key="character.id"
          class="character-card"
          :data-race="character.race"
          :data-faction="character.faction"
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
    id: 'human-paladin',
    name: 'Paladín Humano',
    icon: '⚔️',
    description: 'Un noble paladín de la Alianza, maestro del honor y la justicia',
    color: '#4A90E2',
    race: 'human',
    faction: 'alliance'
  },
  {
    id: 'orc-warrior',
    name: 'Guerrero Orco',
    icon: '🪓',
    description: 'Un feroz guerrero de la Horda, forjado en batalla',
    color: '#8B4513',
    race: 'orc',
    faction: 'horde'
  },
  {
    id: 'elf-mage',
    name: 'Mago Élfico',
    icon: '🔮',
    description: 'Un sabio mago élfico, maestro de las artes arcanas',
    color: '#9370DB',
    race: 'elf',
    faction: 'alliance'
  },
  {
    id: 'human-warrior',
    name: 'Guerrero Humano',
    icon: '🛡️',
    description: 'Un valiente guerrero humano de la Alianza',
    color: '#1E90FF',
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
  background: 
    linear-gradient(180deg, #2c1810 0%, #1a0f08 50%, #0d0603 100%),
    url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23000000' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
}

.background-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(212, 175, 55, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(139, 69, 19, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 40% 20%, rgba(178, 34, 34, 0.1) 0%, transparent 50%);
  animation: pulse 8s ease-in-out infinite;
  pointer-events: none;
}

.mountains {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 250px;
  background: linear-gradient(to top, #1a0f08 0%, transparent 100%);
  clip-path: polygon(0 100%, 0 70%, 15% 75%, 30% 60%, 45% 70%, 60% 55%, 75% 65%, 90% 50%, 100% 60%, 100% 100%);
  opacity: 0.6;
  box-shadow: inset 0 -50px 100px rgba(0, 0, 0, 0.5);
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
  font-family: 'Cinzel', 'Uncial Antiqua', serif;
  font-size: 5.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #d4af37 0%, #c9a961 30%, #8b6914 60%, #b22222 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 
    0 0 40px rgba(212, 175, 55, 0.6),
    0 0 80px rgba(139, 69, 19, 0.4),
    2px 2px 4px rgba(0, 0, 0, 0.8);
  margin-bottom: 0.5rem;
  letter-spacing: 6px;
  text-transform: uppercase;
  position: relative;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
}

.title-subtitle {
  display: block;
  font-family: 'Cinzel', serif;
  font-size: 1.3rem;
  font-weight: 600;
  color: #c9a961;
  letter-spacing: 10px;
  text-transform: uppercase;
  margin-top: 0.5rem;
  text-shadow: 
    0 0 20px rgba(212, 175, 55, 0.5),
    2px 2px 4px rgba(0, 0, 0, 0.8);
}

.subtitle {
  font-size: 1.5rem;
  color: #d4af37;
  margin-top: 1rem;
  font-weight: 400;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
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
  background: 
    linear-gradient(135deg, rgba(44, 24, 16, 0.95) 0%, rgba(26, 15, 8, 0.95) 100%),
    repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px);
  border-radius: 12px;
  padding: 2.5rem 2rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 3px solid rgba(212, 175, 55, 0.3);
  border-style: double;
  overflow: hidden;
  backdrop-filter: blur(10px);
  animation: fadeInUp 0.6s ease-out both;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.6),
    inset 0 0 30px rgba(212, 175, 55, 0.1),
    0 0 20px rgba(139, 69, 19, 0.3);
}

/* Estilos específicos por raza */
.character-card[data-race="human"] {
  border-color: rgba(74, 144, 226, 0.5);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.6),
    inset 0 0 30px rgba(74, 144, 226, 0.15),
    0 0 20px rgba(30, 144, 255, 0.4);
}

.character-card[data-race="human"]:hover {
  border-color: rgba(74, 144, 226, 0.8);
  box-shadow: 
    0 20px 60px rgba(74, 144, 226, 0.5),
    inset 0 0 50px rgba(74, 144, 226, 0.25),
    0 0 40px rgba(30, 144, 255, 0.6);
}

.character-card[data-race="orc"] {
  border-color: rgba(139, 69, 19, 0.5);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.6),
    inset 0 0 30px rgba(139, 69, 19, 0.15),
    0 0 20px rgba(178, 34, 34, 0.4);
}

.character-card[data-race="orc"]:hover {
  border-color: rgba(178, 34, 34, 0.8);
  box-shadow: 
    0 20px 60px rgba(178, 34, 34, 0.5),
    inset 0 0 50px rgba(139, 69, 19, 0.25),
    0 0 40px rgba(220, 20, 60, 0.6);
}

.character-card[data-race="elf"] {
  border-color: rgba(147, 112, 219, 0.5);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.6),
    inset 0 0 30px rgba(147, 112, 219, 0.15),
    0 0 20px rgba(138, 43, 226, 0.4);
}

.character-card[data-race="elf"]:hover {
  border-color: rgba(147, 112, 219, 0.8);
  box-shadow: 
    0 20px 60px rgba(147, 112, 219, 0.5),
    inset 0 0 50px rgba(147, 112, 219, 0.25),
    0 0 40px rgba(138, 43, 226, 0.6);
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
  animation: glow 2s ease-in-out infinite;
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.2) 0%, transparent 70%);
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
  filter: drop-shadow(0 0 20px rgba(212, 175, 55, 0.6)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.8));
  transition: transform 0.3s;
  position: relative;
  z-index: 2;
}

.character-card:hover .character-icon {
  transform: scale(1.1) rotate(5deg);
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 0 30px rgba(212, 175, 55, 0.8)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.8));
}

.character-card[data-race="human"]:hover .character-icon {
  filter: drop-shadow(0 0 30px rgba(74, 144, 226, 0.8)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.8));
}

.character-card[data-race="orc"]:hover .character-icon {
  filter: drop-shadow(0 0 30px rgba(205, 133, 63, 0.8)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.8));
}

.character-card[data-race="elf"]:hover .character-icon {
  filter: drop-shadow(0 0 30px rgba(147, 112, 219, 0.8)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.8));
}

.icon-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border: 3px solid rgba(212, 175, 55, 0.4);
  border-style: double;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
}

.character-card[data-race="human"] .icon-ring {
  border-color: rgba(74, 144, 226, 0.5);
  box-shadow: 0 0 20px rgba(74, 144, 226, 0.4);
}

.character-card[data-race="orc"] .icon-ring {
  border-color: rgba(205, 133, 63, 0.5);
  box-shadow: 0 0 20px rgba(178, 34, 34, 0.4);
}

.character-card[data-race="elf"] .icon-ring {
  border-color: rgba(147, 112, 219, 0.5);
  box-shadow: 0 0 20px rgba(147, 112, 219, 0.4);
}

.character-info {
  position: relative;
  z-index: 2;
}

.character-card h3 {
  font-family: 'Cinzel', serif;
  font-size: 1.9rem;
  color: #d4af37;
  margin-bottom: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 3px;
  text-shadow: 
    0 0 10px rgba(212, 175, 55, 0.5),
    2px 2px 4px rgba(0, 0, 0, 0.8);
}

.character-card[data-race="human"] h3 {
  color: #4A90E2;
  text-shadow: 
    0 0 10px rgba(74, 144, 226, 0.6),
    2px 2px 4px rgba(0, 0, 0, 0.8);
}

.character-card[data-race="orc"] h3 {
  color: #CD853F;
  text-shadow: 
    0 0 10px rgba(205, 133, 63, 0.6),
    2px 2px 4px rgba(0, 0, 0, 0.8);
}

.character-card[data-race="elf"] h3 {
  color: #9370DB;
  text-shadow: 
    0 0 10px rgba(147, 112, 219, 0.6),
    2px 2px 4px rgba(0, 0, 0, 0.8);
}

.character-card p {
  color: rgba(212, 175, 55, 0.9);
  font-size: 1rem;
  line-height: 1.6;
  font-weight: 400;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

.card-footer {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid rgba(212, 175, 55, 0.2);
  border-style: double;
}

.select-hint {
  color: rgba(212, 175, 55, 0.6);
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 2px;
  transition: all 0.3s;
  text-transform: uppercase;
}

.character-card:hover .select-hint {
  color: #d4af37;
  transform: translateX(5px);
  text-shadow: 0 0 10px rgba(212, 175, 55, 0.6);
}

.action-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.start-button {
  position: relative;
  background: 
    linear-gradient(135deg, #8b4513 0%, #a0522d 30%, #cd853f 60%, #daa520 100%),
    repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.1) 5px, rgba(0,0,0,0.1) 10px);
  color: #fff;
  border: 4px solid #d4af37;
  border-style: double;
  padding: 1.2rem 4rem;
  font-size: 1.4rem;
  font-weight: 700;
  font-family: 'Cinzel', serif;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.6),
    inset 0 0 20px rgba(212, 175, 55, 0.2),
    0 0 30px rgba(139, 69, 19, 0.4);
  text-transform: uppercase;
  letter-spacing: 3px;
  overflow: hidden;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
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
  box-shadow: 
    0 15px 40px rgba(0, 0, 0, 0.8),
    inset 0 0 30px rgba(212, 175, 55, 0.3),
    0 0 50px rgba(212, 175, 55, 0.5);
  border-color: #d4af37;
  animation: glow 2s ease-in-out infinite;
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
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.6), transparent);
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
}

.or-text {
  color: rgba(212, 175, 55, 0.7);
  font-size: 0.9rem;
  font-weight: 400;
  letter-spacing: 3px;
  text-transform: uppercase;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
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

