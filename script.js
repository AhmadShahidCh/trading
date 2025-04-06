function tradingTracker(){return{
phases:[
{startBalance:100,endBalance:1000,totalTasks:30,completedTasks:0,profitTarget:30},
{startBalance:1000,endBalance:2000,totalTasks:20,completedTasks:0,profitTarget:50},
{startBalance:2000,endBalance:3000,totalTasks:10,completedTasks:0,profitTarget:100}],
currentPhase:1,currentTask:1,currentBalance:100,currentTaskProfit:0,excessProfit:0,
tradeHistory:[],tradeAmount:null,showAnalytics:false,showHistory:false,showSettings:false,
showRecentTradesOnDashboard:true,totalTrades:0,winningTrades:0,losingTrades:0,chart:null,
initApp(){this.loadData();this.$nextTick(()=>this.initChart());},
saveData(){localStorage.setItem('tradingTrackerData',JSON.stringify({
  phases:this.phases,currentPhase:this.currentPhase,currentTask:this.currentTask,
  currentBalance:this.currentBalance,currentTaskProfit:this.currentTaskProfit,
  excessProfit:this.excessProfit,tradeHistory:this.tradeHistory,totalTrades:this.totalTrades,
  winningTrades:this.winningTrades,losingTrades:this.losingTrades,showAnalytics:this.showAnalytics,
  showHistory:this.showHistory,showSettings:this.showSettings,showRecentTradesOnDashboard:this.showRecentTradesOnDashboard
}));},
loadData(){Object.assign(this,JSON.parse(localStorage.getItem('tradingTrackerData'))||{});},
initChart(){
  let bh=[{x:new Date(Date.now()-((this.tradeHistory.length+1)*864e5)),y:100}];
  this.tradeHistory.forEach(t=>bh.push({x:new Date(t.timestamp),y:t.balanceAfter}));
  bh.sort((a,b)=>a.x-b.x);

  let options={
    chart:{type:'line',height:'100%',width:'100%'},
    series:[{name:'Account Balance',data:bh}],
    xaxis:{type:'datetime',labels:{format:'dd MMM'}},
    yaxis:{title:{text:'Balance ($)'}},
    stroke:{curve:'smooth'},
    tooltip:{x:{format:'dd MMM yyyy'}}
  };
  this.chart=new ApexCharts(document.getElementById('balanceChart'),options);
  this.chart.render();
},
updateChart(){
  if(!this.chart)return;
  let bh=[{x:new Date(Date.now()-((this.tradeHistory.length+1)*864e5)),y:100}];
  this.tradeHistory.forEach(t=>bh.push({x:new Date(t.timestamp),y:t.balanceAfter}));
  bh.sort((a,b)=>a.x-b.x);
  this.chart.updateSeries([{name:'Account Balance',data:bh}]);
},
addTrade() {
  if (this.tradeAmount == null || isNaN(this.tradeAmount)) return;
  this.currentBalance += this.tradeAmount;
  if (this.tradeAmount > 0) {
    this.winningTrades++;
    const rewardImages = [
      'ningning-aespa-armageddon-480@0@j-thumb.jpg',
      'giselle-aespa-armageddon-454@0@j-thumb.jpg',
      'winter-aespa-armageddon-486@0@j-thumb.jpg',
      'wallpaper/karina-got-the-beat-stamp-on-it-girls-on-top-165@0@i-thumb.jpg'
    ];
    const randomImage = rewardImages[Math.floor(Math.random() * rewardImages.length)];
    showRewardModal(randomImage);
  } else {
    this.losingTrades++;
  }
  this.tradeHistory.push({
    phase: this.currentPhase,
    task: this.currentTask,
    amount: this.tradeAmount,
    balanceAfter: this.currentBalance,
    timestamp: Date.now()
  });
  this.totalTrades++;
  this.currentTaskProfit += this.tradeAmount;
  this.tradeAmount = null;
  this.checkTaskCompletion();
  this.$nextTick(() => this.updateChart());
  this.saveData();
},
checkTaskCompletion(){
  let target=this.phases[this.currentPhase-1].profitTarget;
  if(this.currentTaskProfit>=target){
    this.excessProfit=this.currentTaskProfit-target;
    this.phases[this.currentPhase-1].completedTasks++;
    if(this.phases[this.currentPhase-1].completedTasks>=this.phases[this.currentPhase-1].totalTasks){
      if(this.currentPhase<this.phases.length){
        this.currentPhase++;
        this.currentTask=1;
      } else {
        alert('Congratulations! You have successfully completed your trading plan. Keep up the great work!');
        return;
      }
    } else this.currentTask++;
    this.currentTaskProfit=this.excessProfit;this.excessProfit=0;this.checkTaskCompletion();
  }
},
getCurrentProfitTarget(){return this.phases[this.currentPhase-1].profitTarget;},
calculatePhaseProgress(n) {
  let p = this.phases[n - 1],
      tw = 100 / p.totalTasks,
      tp = (this.currentTaskProfit / this.phases[this.currentPhase - 1].profitTarget) * tw;
  return n === this.currentPhase
    ? Math.min(100, (p.completedTasks * tw + tp).toFixed(1))
    : Math.min(100, ((p.completedTasks / p.totalTasks) * 100).toFixed(1));
},
calculateWinRate(){return this.totalTrades?((this.winningTrades/this.totalTrades)*100).toFixed(1):0;},
getCurrentTaskTrades(){return this.tradeHistory.filter(t=>t.phase===this.currentPhase&&t.task===this.currentTask);},
calculateAverageTradeForTask(){let trades=this.getCurrentTaskTrades();return trades.length?trades.reduce((s,t)=>s+t.amount,0)/trades.length:0;},
getRecentTrades(n){return this.tradeHistory.slice(-n);},
calculateAvgTradesPerTask(p){
  let pt=this.tradeHistory.filter(t=>t.phase===p),ct=this.phases[p-1].completedTasks;
  if(!ct)return 0;
  let tasks=new Set(pt.map(t=>t.task)).size;
  return tasks?pt.length/tasks:0;
},
calculateAvgProfitPerTask(p){return this.phases[p-1].completedTasks?this.phases[p-1].profitTarget:0;},
resetData(){if(confirm('Are you sure you want to reset all data? This cannot be undone.')){localStorage.removeItem('tradingTrackerData');location.reload();}},
exportData(){
  let data={phases:this.phases,currentPhase:this.currentPhase,currentTask:this.currentTask,
    currentBalance:this.currentBalance,currentTaskProfit:this.currentTaskProfit,excessProfit:this.excessProfit,
    tradeHistory:this.tradeHistory,totalTrades:this.totalTrades,winningTrades:this.winningTrades,
    losingTrades:this.losingTrades,showAnalytics:this.showAnalytics,showHistory:this.showHistory,
    showSettings:this.showSettings,showRecentTradesOnDashboard:this.showRecentTradesOnDashboard};
  let blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),
  url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='trading-tracker-data.json';
  document.body.appendChild(a);a.click();
  document.body.removeChild(a);URL.revokeObjectURL(url);
},
importData(e){
  let f=e.target.files[0];if(!f)return;
  let r=new FileReader();
  r.onload=e=>{try{let d=JSON.parse(e.target.result);if(!d.phases||!Array.isArray(d.phases))throw new Error('Invalid data format');
    localStorage.setItem('tradingTrackerData',JSON.stringify(d));location.reload();}catch(err){alert('Error importing data: '+err.message);}};
  r.readAsText(f);
}
}};
