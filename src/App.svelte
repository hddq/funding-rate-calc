<script lang="ts">
  let startDate = $state('');
  let endDate = $state('');
  let positionType = $state<'LONG' | 'SHORT'>('LONG');
  let capital = $state(1000);
  let loading = $state(false);
  let results = $state<null | {
    initialPrice: number;
    btcSize: number;
    count: number;
    totalLinear: number;
    totalInverse: number;
  }>(null);
  let error = $state('');

  async function calculate() {
    if (!startDate || !endDate) {
      error = "Please select both start and end dates.";
      return;
    }
    
    error = '';
    loading = true;
    results = null;

    try {
      const startMs = new Date(startDate).getTime();
      const endMs = new Date(endDate).getTime();
      
      if (startMs >= endMs) {
         error = "Start date must be before end date.";
         loading = false;
         return;
      }

      let currentStart = startMs;
      let totalLinear = 0;
      let totalInverse = 0;
      let btcSize = 0;
      let initialPrice = 0;
      let count = 0;

      while (currentStart < endMs) {
        const url = `https://fapi.binance.com/fapi/v1/fundingRate?symbol=BTCUSDT&startTime=${currentStart}&endTime=${endMs}&limit=1000`;
        const res = await fetch(url);
        if (!res.ok) {
           throw new Error(`API error: ${res.statusText}`);
        }
        
        const data = await res.json();
        if (!data || data.length === 0) {
          break;
        }

        for (const item of data) {
          const time = Number(item.fundingTime);
          if (time > endMs) continue;

          const markPrice = Number(item.markPrice);
          const fundingRate = Number(item.fundingRate);
          
          if (count === 0) {
            initialPrice = markPrice;
            btcSize = capital / initialPrice;
          }
          
          const positionNotionalLinear = btcSize * markPrice;
          let earningsLinear = 0;
          let earningsInverse = 0;
          
          if (positionType === 'LONG') {
            earningsLinear = -1 * positionNotionalLinear * fundingRate;
            earningsInverse = -1 * capital * fundingRate;
          } else {
            earningsLinear = 1 * positionNotionalLinear * fundingRate;
            earningsInverse = 1 * capital * fundingRate;
          }
          
          totalLinear += earningsLinear;
          totalInverse += earningsInverse;
          
          count++;
        }
        
        const lastTime = Number(data[data.length - 1].fundingTime);
        if (lastTime >= endMs) break;
        
        if (currentStart === lastTime + 1) {
           break; 
        }
        currentStart = lastTime + 1;
      }

      if (count === 0) {
         error = "No funding events found for the selected period.";
      } else {
         results = {
            initialPrice,
            btcSize,
            count,
            totalLinear,
            totalInverse
         };
      }
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      loading = false;
    }
  }
</script>

<main class="app-container">
  <div class="glass-panel">
    <h1>BTC Funding Calculator</h1>
    <p class="subtitle">Calculate historical funding rate returns for Binance BTCUSDT</p>
    
    <div class="position-toggle">
      <button 
        class="toggle-btn {positionType === 'LONG' ? 'active long' : ''}" 
        onclick={() => positionType = 'LONG'}>
        LONG
      </button>
      <button 
        class="toggle-btn {positionType === 'SHORT' ? 'active short' : ''}" 
        onclick={() => positionType = 'SHORT'}>
        SHORT
      </button>
    </div>
    
    <div class="input-group">
      <div class="input-field">
        <label for="capital">Position Size (USD)</label>
        <input type="number" id="capital" min="1" step="any" bind:value={capital} />
      </div>

      <div class="input-field">
        <label for="startDate">Start Date & Time</label>
        <input type="datetime-local" id="startDate" bind:value={startDate} />
      </div>
      
      <div class="input-field">
        <label for="endDate">End Date & Time</label>
        <input type="datetime-local" id="endDate" bind:value={endDate} />
      </div>
    </div>
    
    <button class="calc-button" onclick={calculate} disabled={loading}>
      {#if loading}
        <span class="spinner"></span>
        Calculating...
      {:else}
        Calculate Returns
      {/if}
    </button>
    
    {#if error}
      <div class="error-message">
        {error}
      </div>
    {/if}
    
    {#if results}
      <div class="results-container">
        <div class="summary-cards">
           <div class="card">
             <span class="label">Initial BTC Price</span>
             <span class="value">${results.initialPrice.toFixed(2)}</span>
           </div>
           <div class="card">
             <span class="label">BTC Position Size</span>
             <span class="value">{results.btcSize.toFixed(6)} BTC</span>
           </div>
           <div class="card">
             <span class="label">Funding Events</span>
             <span class="value">{results.count}</span>
           </div>
        </div>
        
        <div class="assumptions">
          <div class="assumption-block linear">
            <h3>USDT-Margined (Linear)</h3>
            <p>You {positionType} exactly {results.btcSize.toFixed(6)} BTC and hold.</p>
            <div class="earnings {results.totalLinear >= 0 ? 'positive' : 'negative'}">
              {results.totalLinear >= 0 ? '+' : ''}{results.totalLinear.toFixed(4)} USDT
            </div>
          </div>
          
          <div class="assumption-block inverse">
            <h3>Coin-Margined (Inverse)</h3>
            <p>Position notional stays at exactly ${capital}.</p>
            <div class="earnings {results.totalInverse >= 0 ? 'positive' : 'negative'}">
              {results.totalInverse >= 0 ? '+' : ''}{results.totalInverse.toFixed(4)} USD
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</main>
