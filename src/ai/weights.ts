export const WEIGHTS = {
  CENTER_POSITION: 150,     // Bonus très élevé pour être proche du centre
  BLOCKING_ENEMY: 80,       // Bonus important pour bloquer un pion adverse
  CONNECTED_ALLIES: 100,    // Bonus très élevé pour chaque allié connecté
  CHAIN_FORMATION: 120,     // Bonus critique pour former une chaîne
  ISOLATION_PENALTY: -100,  // Fort malus pour être isolé
  CAPTURE_BONUS: 200,       // Bonus très élevé pour capturer un pion adverse
  BREAK_CHAIN_BONUS: 250,   // Bonus maximal pour casser une chaîne ennemie
  REPETITION_PENALTY: -150, // Malus très élevé pour les mouvements répétitifs
  PROTECTION_BONUS: 90,     // Bonus important pour protéger un allié menacé
  FUTURE_CONNECTION: 110,   // Bonus élevé pour créer des opportunités de connexion
  DISTANCE_TO_ENEMY: 70,    // Bonus pour rester proche des pions ennemis
  CENTRAL_CONTROL: 130,     // Bonus pour contrôler la zone centrale
  WINNING_POSITION: 100000, // Valeur TRÈS élevée pour une position gagnante
  LOSING_POSITION: -100000  // Valeur TRÈS basse pour une position perdante
};