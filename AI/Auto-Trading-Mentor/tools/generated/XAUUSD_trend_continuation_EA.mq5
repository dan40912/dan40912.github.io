//+------------------------------------------------------------------+
//|  XAUUSD_trend_continuation_EA.mq5                                                  |
//|  由 prompt_to_mt5.py 自動產生 (2026-06-24)                       |
//|                                                                  |
//|  來源 prompt 模式: 回放檢討                                   |
//|  策略框架: 順勢延續  ->  module: trend_continuation      |
//|                                                                  |
//|  === 重要聲明 ===                                                 |
//|  本 EA 由風控審查 prompt 轉譯而來。prompt 的風控規則已忠實轉為      |
//|  程式碼，但「進場訊號」在原 prompt 並未寫死，下方 Signal_*() 為     |
//|  可替換的占位策略，必須自行用 Strategy Tester 驗證。風控不等於      |
//|  盈利優勢；本 EA 不保證獲利。實盤風險自負。                          |
//+------------------------------------------------------------------+
#property copyright "prompt_to_mt5.py"
#property version   "1.00"
#property strict

#include <Trade/Trade.mqh>
CTrade  trade;

//==================== 由 prompt 轉譯的設定 ==========================
input string  InpSymbol          = "XAUUSD";    // 必須交易的商品 (prompt: Market)
input string  InpCurrency        = "USD";  // 帳戶幣別 (prompt: Currency)
input double  InpMaxTradeLoss    = 1000.0;   // 單筆最大虧損 (USD)
input double  InpDailyLossLimit  = 3000.0; // 每日虧損上限 (USD)
input double  InpMinRR           = 1.00;      // 最低風報比
input double  InpMaxContracts    = 4.00; // 最大口數/手數
input double  InpProfitTarget    = 3000.0; // 當日盈利目標 (USD)，達標後不開新倉
input bool    InpAllowLiveAuto   = false;          // prompt 安全邊界4: MVP 不支援 Live Auto
input bool    InpAutoAllowedByMode= true; // 由 prompt Mode 推得是否允許自動下單

//==================== 進場策略參數（可替換）========================
input int     InpFastEMA         = 20;   // 順勢: 快線
input int     InpSlowEMA         = 50;   // 順勢: 慢線
input int     InpATRPeriod       = 14;   // 停損/停利用 ATR
input double  InpSL_ATR          = 1.5;  // 停損 = N x ATR
input double  InpTP_ATR          = 2.0;  // 停利 = N x ATR (連同 InpMinRR 一起把關)
input int     InpMagic           = 78543140;
input bool    InpOncePerBar      = true; // 只在新K棒判斷

//==================== 內部 handle / 狀態 ============================
int    hFast = INVALID_HANDLE, hSlow = INVALID_HANDLE, hATR = INVALID_HANDLE;
datetime g_lastBar = 0;

//+------------------------------------------------------------------+
int OnInit()
  {
   trade.SetExpertMagicNumber(InpMagic);
   trade.SetDeviationInPoints(20);

   hFast = iMA(InpSymbol, _Period, InpFastEMA, 0, MODE_EMA, PRICE_CLOSE);
   hSlow = iMA(InpSymbol, _Period, InpSlowEMA, 0, MODE_EMA, PRICE_CLOSE);
   hATR  = iATR(InpSymbol, _Period, InpATRPeriod);
   if(hFast==INVALID_HANDLE || hSlow==INVALID_HANDLE || hATR==INVALID_HANDLE)
     {
      Print("指標 handle 建立失敗");
      return(INIT_FAILED);
     }
   return(INIT_SUCCEEDED);
  }

void OnDeinit(const int reason)
  {
   if(hFast!=INVALID_HANDLE) IndicatorRelease(hFast);
   if(hSlow!=INVALID_HANDLE) IndicatorRelease(hSlow);
   if(hATR !=INVALID_HANDLE) IndicatorRelease(hATR);
  }

//+------------------------------------------------------------------+
//|  主迴圈                                                           |
//+------------------------------------------------------------------+
void OnTick()
  {
   // 對應 prompt 的 Safety Gate：狀態不安全就「不動作」(= MANUAL/WAIT)
   if(!SafetyGate())            return;

   // 只在新K棒判斷（對應每回合 heartbeat）
   if(InpOncePerBar)
     {
      datetime t = iTime(InpSymbol, _Period, 0);
      if(t==g_lastBar) { ManageOpenPosition(); return; }
      g_lastBar = t;
     }

   // 已有部位 -> 只做管理，絕不加碼/攤平 (prompt: Add rule / 禁止DCA)
   if(HasPosition()) { ManageOpenPosition(); return; }

   // === Risk Manager 預檢 (prompt 第二段風控) ===
   if(ProfitTargetReached())  return;   // 盈利達標，保護優先，不開新倉
   if(DailyLossReached())     return;   // 當日虧損達上限，停止新倉

   // === Market Structure：取得方向 ===
   int dir = Signal_trend_continuation();   // +1 買, -1 賣, 0 無
   if(dir==0) return;

   TryEnter(dir);
  }

//+------------------------------------------------------------------+
//|  Safety Gate（忠實轉譯 prompt 的 fail-closed）                    |
//+------------------------------------------------------------------+
bool SafetyGate()
  {
   // 商品必須正確
   if(_Symbol != InpSymbol)                                   return(false);
   // 終端機/帳戶必須允許交易
   if(!TerminalInfoInteger(TERMINAL_TRADE_ALLOWED))           return(false);
   if(!MQLInfoInteger(MQL_TRADE_ALLOWED))                     return(false);
   if(!AccountInfoInteger(ACCOUNT_TRADE_ALLOWED))             return(false);
   if(!AccountInfoInteger(ACCOUNT_TRADE_EXPERT))              return(false);
   // 商品必須可交易
   if((ENUM_SYMBOL_TRADE_MODE)SymbolInfoInteger(InpSymbol,SYMBOL_TRADE_MODE)
        == SYMBOL_TRADE_MODE_DISABLED)                        return(false);
   // 幣別檢查 (prompt: Currency / USD)
   if(StringCompare(AccountInfoString(ACCOUNT_CURRENCY), InpCurrency, false)!=0)
      return(false);

   // === REAL 帳戶禁止自動下單 (prompt 安全邊界 3、4) ===
   long mode = AccountInfoInteger(ACCOUNT_TRADE_MODE);
   bool isReal = (mode == ACCOUNT_TRADE_MODE_REAL);
   bool inTester = (bool)MQLInfoInteger(MQL_TESTER);
   if(isReal && !inTester && !InpAllowLiveAuto)               return(false);
   if(!InpAutoAllowedByMode && !inTester)                     return(false);

   return(true);
  }

//+------------------------------------------------------------------+
bool HasPosition()
  {
   for(int i=PositionsTotal()-1;i>=0;i--)
     {
      ulong tk = PositionGetTicket(i);
      if(tk==0) continue;
      if(PositionGetString(POSITION_SYMBOL)==InpSymbol &&
         PositionGetInteger(POSITION_MAGIC)==InpMagic)
         return(true);
     }
   return(false);
  }

//+------------------------------------------------------------------+
//|  當日已實現+浮動損益                                              |
//+------------------------------------------------------------------+
double TodayProfit()
  {
   datetime dayStart = (datetime)(TimeCurrent() - (TimeCurrent() % 86400));
   double realized = 0.0;
   if(HistorySelect(dayStart, TimeCurrent()))
     {
      for(int i=HistoryDealsTotal()-1;i>=0;i--)
        {
         ulong d = HistoryDealGetTicket(i);
         if(d==0) continue;
         if(HistoryDealGetInteger(d,DEAL_MAGIC)!=InpMagic) continue;
         if(HistoryDealGetString(d,DEAL_SYMBOL)!=InpSymbol) continue;
         realized += HistoryDealGetDouble(d,DEAL_PROFIT)
                   + HistoryDealGetDouble(d,DEAL_SWAP)
                   + HistoryDealGetDouble(d,DEAL_COMMISSION);
        }
     }
   double floating = 0.0;
   for(int i=PositionsTotal()-1;i>=0;i--)
     {
      ulong tk = PositionGetTicket(i);
      if(tk==0) continue;
      if(PositionGetString(POSITION_SYMBOL)==InpSymbol &&
         PositionGetInteger(POSITION_MAGIC)==InpMagic)
         floating += PositionGetDouble(POSITION_PROFIT);
     }
   return(realized + floating);
  }

bool DailyLossReached()
  {
   if(InpDailyLossLimit<=0) return(false);
   return( TodayProfit() <= -InpDailyLossLimit );   // 虧損達上限
  }

bool ProfitTargetReached()
  {
   if(InpProfitTarget<=0) return(false);
   return( TodayProfit() >= InpProfitTarget );      // 盈利達標 -> 保護優先
  }

//+------------------------------------------------------------------+
//|  依風險計算手數：單筆虧損不超過 InpMaxTradeLoss                    |
//+------------------------------------------------------------------+
double LotsForRisk(double slDistancePrice)
  {
   double tickVal  = SymbolInfoDouble(InpSymbol, SYMBOL_TRADE_TICK_VALUE);
   double tickSize = SymbolInfoDouble(InpSymbol, SYMBOL_TRADE_TICK_SIZE);
   if(tickSize<=0 || tickVal<=0 || slDistancePrice<=0) return(0.0);

   double lossPerLot = (slDistancePrice / tickSize) * tickVal;
   if(lossPerLot<=0) return(0.0);

   double lots = InpMaxTradeLoss / lossPerLot;

   // 套用步進/最小/最大與 prompt 的最大口數
   double vmin = SymbolInfoDouble(InpSymbol, SYMBOL_VOLUME_MIN);
   double vmax = SymbolInfoDouble(InpSymbol, SYMBOL_VOLUME_MAX);
   double vstp = SymbolInfoDouble(InpSymbol, SYMBOL_VOLUME_STEP);
   if(vstp>0) lots = MathFloor(lots/vstp)*vstp;
   lots = MathMin(lots, InpMaxContracts);
   lots = MathMin(lots, vmax);

   if(lots < vmin) return(0.0);   // 風險預算撐不起最小手數 -> 不進場 (=WAIT)
   return(NormalizeDouble(lots, 2));
  }

//+------------------------------------------------------------------+
//|  進場（含強制停損 + 最低 RR 把關）                                |
//+------------------------------------------------------------------+
void TryEnter(int dir)
  {
   double atr[];
   if(CopyBuffer(hATR,0,0,1,atr)<1) return;
   double a = atr[0];
   if(a<=0) return;

   double point = _Point;
   double slDist = InpSL_ATR * a;
   double tpDist = InpTP_ATR * a;

   // 最低 RR 把關 (prompt: Minimum RR)
   double rr = (slDist>0) ? (tpDist/slDist) : 0.0;
   if(rr < InpMinRR) return;

   double ask = SymbolInfoDouble(InpSymbol, SYMBOL_ASK);
   double bid = SymbolInfoDouble(InpSymbol, SYMBOL_BID);

   double price, sl, tp;
   if(dir>0) { price=ask; sl=price-slDist; tp=price+tpDist; }
   else      { price=bid; sl=price+slDist; tp=price-tpDist; }

   // 強制停損距離不得小於 broker 最小停損
   long stopsLevel = SymbolInfoInteger(InpSymbol, SYMBOL_TRADE_STOPS_LEVEL);
   if(stopsLevel>0 && slDist < stopsLevel*point) return;

   double lots = LotsForRisk(slDist);
   if(lots<=0) return;   // 風控擋下 -> 不交易

   sl = NormalizeDouble(sl, _Digits);
   tp = NormalizeDouble(tp, _Digits);

   bool ok = (dir>0) ? trade.Buy(lots, InpSymbol, 0.0, sl, tp, "trend_continuation")
                     : trade.Sell(lots, InpSymbol, 0.0, sl, tp, "trend_continuation");

   // 一定要檢查回傳碼
   if(!ok || (trade.ResultRetcode()!=TRADE_RETCODE_DONE &&
              trade.ResultRetcode()!=TRADE_RETCODE_PLACED))
      PrintFormat("下單失敗 ret=%d %s", trade.ResultRetcode(),
                  trade.ResultRetcodeDescription());
  }

//+------------------------------------------------------------------+
//|  既有部位管理：只保本/移動停損，絕不加碼                          |
//+------------------------------------------------------------------+
void ManageOpenPosition()
  {
   for(int i=PositionsTotal()-1;i>=0;i--)
     {
      ulong tk = PositionGetTicket(i);
      if(tk==0) continue;
      if(PositionGetString(POSITION_SYMBOL)!=InpSymbol) continue;
      if(PositionGetInteger(POSITION_MAGIC)!=InpMagic)  continue;

      // 範例：浮盈超過 1xATR 後把停損移到進場價（保本）。可自行擴充。
      double atr[]; if(CopyBuffer(hATR,0,0,1,atr)<1) return;
      double a=atr[0];
      long   type   = PositionGetInteger(POSITION_TYPE);
      double open   = PositionGetDouble(POSITION_PRICE_OPEN);
      double curSL  = PositionGetDouble(POSITION_SL);
      double curTP  = PositionGetDouble(POSITION_TP);
      double price  = (type==POSITION_TYPE_BUY)
                      ? SymbolInfoDouble(InpSymbol,SYMBOL_BID)
                      : SymbolInfoDouble(InpSymbol,SYMBOL_ASK);

      if(type==POSITION_TYPE_BUY && price-open > a && curSL < open)
         trade.PositionModify(InpSymbol, NormalizeDouble(open,_Digits), curTP);
      if(type==POSITION_TYPE_SELL && open-price > a && (curSL>open || curSL==0))
         trade.PositionModify(InpSymbol, NormalizeDouble(open,_Digits), curTP);
     }
  }

//+==================================================================+
//|  進場訊號模組（占位，必須自行驗證/替換）                          |
//|  原 prompt 僅寫策略框架關鍵字，未提供精確進場規則。               |
//+==================================================================+

// 順勢延續：快EMA在慢EMA之上且價格回測快EMA附近 -> 買；反之賣。
int Signal_trend_continuation()
  {
   double f[2], s[2];
   if(CopyBuffer(hFast,0,0,2,f)<2) return(0);
   if(CopyBuffer(hSlow,0,0,2,s)<2) return(0);
   double close1 = iClose(InpSymbol,_Period,1);
   if(f[1]>s[1] && close1>=f[1]*0.999 && close1<=f[1]*1.003) return(+1);
   if(f[1]<s[1] && close1<=f[1]*1.001 && close1>=f[1]*0.997) return(-1);
   return(0);
  }

// 突破：收盤突破前 N 根高/低。
int Signal_breakout()
  {
   int n=20;
   double hh=iHigh(InpSymbol,_Period,iHighest(InpSymbol,_Period,MODE_HIGH,n,1));
   double ll=iLow (InpSymbol,_Period,iLowest (InpSymbol,_Period,MODE_LOW ,n,1));
   double c1=iClose(InpSymbol,_Period,1);
   if(c1>hh) return(+1);
   if(c1<ll) return(-1);
   return(0);
  }

// 均值回歸：價格遠離慢EMA時做反向（示意）。
int Signal_mean_reversion()
  {
   double s[1]; if(CopyBuffer(hSlow,0,0,1,s)<1) return(0);
   double atr[1]; if(CopyBuffer(hATR,0,0,1,atr)<1) return(0);
   double c1=iClose(InpSymbol,_Period,1);
   if(c1 < s[0]-1.5*atr[0]) return(+1);
   if(c1 > s[0]+1.5*atr[0]) return(-1);
   return(0);
  }
//+------------------------------------------------------------------+
