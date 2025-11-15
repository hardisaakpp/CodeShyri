<template>
  <div class="home-view">
    <div class="hero">
      <h1 class="title">CodeShyri</h1>
      <p class="subtitle">Aprende programación con personajes mitológicos andinos</p>
      
      <div class="characters-preview">
        <div 
          v-for="character in characters" 
          :key="character.id"
          class="character-card"
          @click="startGame(character.id)"
        >
          <div class="character-icon">{{ character.icon }}</div>
          <h3>{{ character.name }}</h3>
          <p>{{ character.description }}</p>
        </div>
      </div>

      <button class="start-button" @click="startGame()">
        Comenzar Aventura
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()

const characters = ref([
  {
    id: 'viracocha',
    name: 'Viracocha',
    icon: '👑',
    description: 'El dios creador te guiará en tus primeros pasos'
  },
  {
    id: 'inti',
    name: 'Inti',
    icon: '☀️',
    description: 'El dios del sol iluminará tu camino'
  },
  {
    id: 'pachamama',
    name: 'Pachamama',
    icon: '🌍',
    description: 'La madre tierra te protegerá'
  },
  {
    id: 'amaru',
    name: 'Amaru',
    icon: '🐍',
    description: 'La serpiente sagrada te enseñará sabiduría'
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
}

.hero {
  text-align: center;
  max-width: 1200px;
  width: 100%;
}

.title {
  font-size: 4rem;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.subtitle {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3rem;
}

.characters-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.character-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 2rem;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.character-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.character-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.character-card h3 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.character-card p {
  color: #666;
  font-size: 0.9rem;
}

.start-button {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 1rem 3rem;
  font-size: 1.2rem;
  border-radius: 50px;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
}

.start-button:hover {
  background: #ff5252;
  transform: scale(1.05);
}

.start-button:active {
  transform: scale(0.98);
}
</style>

