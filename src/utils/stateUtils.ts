export const updateStateFromBackend = (state: any) => {
  return {
    gameState: state,
    coins: state.player.data.coins_balance || 0,
    food: state.player.data.food_number || 0,
    medicine: state.player.data.medicine_number || 0,
    maxSlots: state.player.data.population_number || 3,
    dolphins: state.player.data.dolphins || [],
    dolphinCoins: state.player.data.dolphin_token_balance || 0,
    loading: false
  };
}; 