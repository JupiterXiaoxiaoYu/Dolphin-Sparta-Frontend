export const updateStateFromBackend = (state: any) => {
  const dolphins = (state.player.data.dolphins || []).map((dolphin: any) => ({
    id: dolphin.id.toString(),
    type: dolphin.name === "DolphinPikeman" ? 'spear' : 'sword',
    bornTime: dolphin.born_time,
    // lastFed: dolphin.last_fed,
    // lastPetted: dolphin.last_petted,
    satiety: dolphin.satiety,
    isIll: dolphin.health === 0,
    coins: dolphin.generated_coins || 0,
    growthProgress: dolphin.life_stage || 0,
    level: dolphin.level || 1
  }));

  return {
    gameState: state,
    coins: state.player.data.coins_balance || 0,
    food: state.player.data.food_number || 0,
    medicine: state.player.data.medicine_number || 0,
    maxSlots: state.player.data.population_number || 3,
    dolphins: dolphins,
    dolphinCoins: state.player.data.dolphin_token_balance || 0,
    loading: false
  };
}; 