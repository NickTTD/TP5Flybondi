/**
 * 🌟 Vacation Finder for Nelsona 🌟
 * Flybondi Code Challenge Solution
 * Focus: Simplicity + Advanced Functionality
 * Target Users: Nelsona (65) + granddaughter Valentina (16)
 */
class VacationFinder {
  /**
   * Create a VacationFinder
   * @param {Array} flightData - Array of flight objects with origin, destination, price, availability, date
   */
  constructor(flightData) {
    this.flights = flightData;
    this.maxBudget = 800;
  }

  /**
   * Devuelve todos los destinos únicos, excluyendo el origen principal
   * @returns {Array} Array de destinos únicos
   */
  getUniqueDestinations() {
    // Detectar el origen principal (el más frecuente)
    const origins = this.flights.map(f => f.origin);
    const mainOrigin = origins.sort((a, b) =>
      origins.filter(v => v === a).length - origins.filter(v => v === b).length
    ).pop();

    const destinations = [...new Set(this.flights.map(f => f.destination))];
    return destinations.filter(dest => dest !== mainOrigin);
  }

  /**
   * Encuentra las mejores opciones de vacaciones dentro del presupuesto
   * @param {number} budget - Presupuesto máximo (por defecto this.maxBudget)
   * @returns {Object} Contiene resumen y recomendaciones
   */
  findBestVacations(budget = this.maxBudget) {
    const options = this.findRoundTripOptions(budget);
    const recommendations = this.generateRecommendations(options);

    // Resumen
    let summary = {
      message: options.length
        ? `🎉 Encontramos ${options.length} opciones dentro de tu presupuesto de $${budget}!`
        : `😔 No hay opciones dentro de tu presupuesto de $${budget}.`,
      cheapest: null,
      longest: null,
      familyOptions: 0,
    };

    if (options.length) {
      // Opción más barata
      const cheapest = options.reduce((a, b) => (a.totalPrice < b.totalPrice ? a : b));
      summary.cheapest = `💰 Más barata: ${cheapest.destination} $${cheapest.totalPrice} (ahorro $${budget - cheapest.totalPrice})`;
      // Opción más larga
      const longest = options.reduce((a, b) => (a.stayDuration > b.stayDuration ? a : b));
      summary.longest = `⏰ Más larga: ${longest.destination} ${longest.stayDuration} días`;
      // Opciones familiares (al menos 2 asientos en ambos tramos)
      summary.familyOptions = options.filter(opt => opt.totalAvailability >= 2).length;
    }

    return { summary, recommendations };
  }

  /**
   * Encuentra todas las combinaciones ida y vuelta dentro del presupuesto
   * @param {number} budget - Presupuesto máximo
   * @returns {Array} Array de opciones de viaje
   */
  findRoundTripOptions(budget) {
    const destinations = this.getUniqueDestinations();
    let options = [];

    destinations.forEach(dest => {
      // Vuelos de ida desde origen principal
      const outboundFlights = this.flights.filter(f => f.origin !== dest && f.destination === dest);
      // Vuelos de vuelta al origen principal
      const returnFlights = this.flights.filter(f => f.origin === dest && f.destination !== dest);

      outboundFlights.forEach(outbound => {
        returnFlights.forEach(ret => {
          // Solo considerar si la vuelta es después de la ida
          if (new Date(ret.date) > new Date(outbound.date)) {
            const totalPrice = outbound.price + ret.price;
            if (totalPrice <= budget) {
              options.push({
                destination: dest,
                outbound,
                return: ret,
                totalPrice,
                stayDuration: Math.round((new Date(ret.date) - new Date(outbound.date)) / (1000 * 60 * 60 * 24)),
                totalAvailability: Math.min(outbound.availability, ret.availability),
                savings: budget - totalPrice,
              });
            }
          }
        });
      });
    });

    return options;
  }

  /**
   * Genera recomendaciones personalizadas
   * @param {Array} options - Opciones de viaje
   * @returns {Array} Opciones con recomendaciones y temporada
   */
  generateRecommendations(options) {
    // Ordenar por precio, duración, disponibilidad, etc.
    return options
      .sort((a, b) => a.totalPrice - b.totalPrice || b.stayDuration - a.stayDuration)
      .map((opt, idx) => ({
        ...opt,
        recommendation:
          idx === 0
            ? "🥇 Best Option! 💰 Great Savings! 🏖️ Perfect for relajarse 👥 Family-friendly"
            : opt.stayDuration >= 10
            ? "⏳ ¡Vacaciones largas! Ideal para desconectar"
            : "💰 Great Savings! 👥 Family-friendly",
        seasonInfo: this.getSeasonInfo(opt.outbound.date),
      }));
  }

  /**
   * Obtiene información de la temporada según el mes
   * @param {string} dateStr - Fecha en formato ISO
   * @returns {string} Nombre de la temporada con emoji
   */
  getSeasonInfo(dateStr) {
    const month = new Date(dateStr).getMonth() + 1;
    if ([12, 1, 2].includes(month)) return "Verano ☀️";
    if ([3, 4, 5].includes(month)) return "Otoño 🍂";
    if ([6, 7, 8].includes(month)) return "Invierno ❄️";
    return "Primavera 🌸";
  }

  /**
   * Formatea una fecha en estilo local Argentino
   * @param {string} dateStr - Fecha en formato ISO
   * @returns {string} Fecha formateada
   */
  formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  }
}

/**
 * Exporta los resultados simulando un archivo JSON
 * @param {Object} results - Resultados de vacaciones
 * @param {string} filename - Nombre del archivo
 * @returns {Object} Datos preparados para exportación
 */
function exportResults(results, filename = 'vacaciones_nelsona.json') {
  const exportData = {
    generatedAt: new Date().toISOString(),
    budget: 800,
    user: "Nelsona (65)",
    assistant: "Valentina (16)",
    ...results
  };

  return exportData;
}
