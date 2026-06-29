#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
prompt_to_mt5.py
=================
把本專案風格的「AI Trading Workflow」prompt（Markdown）翻譯成一支可編譯、
可在 MT5 Strategy Tester / Demo 執行的 MQL5 Expert Advisor (.mq5)。

它做什麼：
  - 解析 prompt 的 `User configuration` 與風控數值。
  - 把所有「硬性風控規則」忠實轉成 EA 程式碼（強制停損、單筆/每日虧損上限、
    最低 RR、最大口數、禁止加碼/攤平、盈利目標鎖、REAL 帳戶禁止自動下單）。
  - 對於 prompt 沒寫死的「策略框架」（如 順勢延續），放入一個清楚標註、
    可自行替換的 EMA 順勢預設進場邏輯，讓 EA 能實際運作。

它不做什麼（誠實聲明）：
  - 不會把 prompt 變成一個保證獲利的策略。風控≠盈利優勢(edge)。
  - 不會復刻「看 TradingView 截圖判讀」的能力（那是 LLM 的事，MT5 做不到）。
  - 預設進場僅為可運作的占位策略，需自行用 Strategy Tester 驗證與替換。

用法：
  python prompt_to_mt5.py <prompt.md> [-o 輸出.mq5]
  python prompt_to_mt5.py example_prompt.md -o generated/XAUUSD_EA.mq5
"""

import argparse
import datetime as _dt
import os
import re
import sys


# ----------------------------------------------------------------------------
# 1. 解析 prompt
# ----------------------------------------------------------------------------

def _num(text):
    """從字串抽出第一個數字（支援千分位逗號），找不到回傳 None。"""
    if text is None:
        return None
    m = re.search(r"[-+]?\d[\d,]*\.?\d*", text)
    if not m:
        return None
    return float(m.group(0).replace(",", ""))


def _field(prompt, label):
    """抓取 `- Label: value` 或 `Label: value` 形式的單行欄位值。"""
    pat = re.compile(r"^[\-\*\s]*" + re.escape(label) + r"\s*[:：]\s*(.+)$",
                     re.IGNORECASE | re.MULTILINE)
    m = pat.search(prompt)
    return m.group(1).strip() if m else None


# 把策略框架關鍵字對應到預設進場模組
STRATEGY_MAP = {
    "順勢": "trend_continuation",
    "trend": "trend_continuation",
    "延續": "trend_continuation",
    "突破": "breakout",
    "breakout": "breakout",
    "均值": "mean_reversion",
    "回歸": "mean_reversion",
    "reversion": "mean_reversion",
}

# 帳戶模式關鍵字：是否允許自動下單
AUTO_OK_MODES = ["回放", "replay", "demo", "模擬", "paper", "紙上", "backtest", "回測"]


def parse_prompt(prompt: str) -> dict:
    cfg = {}
    cfg["symbol"] = (_field(prompt, "Market") or "XAUUSD").split()[0]
    cfg["currency"] = (_field(prompt, "Currency") or "USD").split()[0]
    cfg["mode_raw"] = _field(prompt, "Mode") or "Replay"
    cfg["framework_raw"] = _field(prompt, "Strategy framework") or "順勢延續"

    cfg["max_trade_loss"] = _num(_field(prompt, "Max trade loss")) or 0.0
    cfg["daily_loss_limit"] = _num(_field(prompt, "Daily loss limit")) or 0.0
    cfg["min_rr"] = _num(_field(prompt, "Minimum RR")) or 1.0
    cfg["max_contracts"] = _num(_field(prompt, "Max contracts")) or 1.0
    cfg["profit_target"] = _num(_field(prompt, "Expected profit target")) or 0.0
    cfg["add_rule"] = _field(prompt, "Add rule") or "需人工確認，AI 不得自動建議加碼"

    # 策略模組
    cfg["strategy_module"] = "trend_continuation"
    for kw, mod in STRATEGY_MAP.items():
        if kw.lower() in cfg["framework_raw"].lower():
            cfg["strategy_module"] = mod
            break

    # 是否允許自動下單（依模式）；live/real → 禁止
    raw = cfg["mode_raw"].lower()
    cfg["auto_allowed"] = any(k in raw for k in AUTO_OK_MODES) and \
        not any(k in raw for k in ["live", "real", "實盤", "真實"])

    return cfg


# ----------------------------------------------------------------------------
# 2. MQL5 EA 模板
# ----------------------------------------------------------------------------

# 使用 @@TOKEN@@ 佔位，避免與 MQL5 大量大括號衝突。
MQL5_TEMPLATE = r"""//+------------------------------------------------------------------+
//|  @@EANAME@@.mq5                                                  |
//|  由 prompt_to_mt5.py 自動產生 (@@GENDATE@@)                       |
//|                                                                  |
//|  來源 prompt 模式: @@MODE_RAW@@                                   |
//|  策略框架: @@FRAMEWORK_RAW@@  ->  module: @@STRATEGY_MODULE@@      |
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
input string  InpSymbol          = "@@SYMBOL@@";    // 必須交易的商品 (prompt: Market)
input string  InpCurrency        = "@@CURRENCY@@";  // 帳戶幣別 (prompt: Currency)
input double  InpMaxTradeLoss    = @@MAX_TRADE_LOSS@@;   // 單筆最大虧損 (USD)
input double  InpDailyLossLimit  = @@DAILY_LOSS_LIMIT@@; // 每日虧損上限 (USD)
input double  InpMinRR           = @@MIN_RR@@;      // 最低風報比
input double  InpMaxContracts    = @@MAX_CONTRACTS@@; // 最大口數/手數
input double  InpProfitTarget    = @@PROFIT_TARGET@@; // 當日盈利目標 (USD)，達標後不開新倉
input bool    InpAllowLiveAuto   = false;          // prompt 安全邊界4: MVP 不支援 Live Auto
input bool    InpAutoAllowedByMode= @@AUTO_ALLOWED@@; // 由 prompt Mode 推得是否允許自動下單

//==================== 進場策略參數（可替換）========================
input int     InpFastEMA         = 20;   // 順勢: 快線
input int     InpSlowEMA         = 50;   // 順勢: 慢線
input int     InpATRPeriod       = 14;   // 停損/停利用 ATR
input double  InpSL_ATR          = 1.5;  // 停損 = N x ATR
input double  InpTP_ATR          = 2.0;  // 停利 = N x ATR (連同 InpMinRR 一起把關)
input int     InpMagic           = @@MAGIC@@;
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
   int dir = Signal_@@STRATEGY_MODULE@@();   // +1 買, -1 賣, 0 無
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

   bool ok = (dir>0) ? trade.Buy(lots, InpSymbol, 0.0, sl, tp, "@@STRATEGY_MODULE@@")
                     : trade.Sell(lots, InpSymbol, 0.0, sl, tp, "@@STRATEGY_MODULE@@");

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
"""


# ----------------------------------------------------------------------------
# 3. 產生 EA
# ----------------------------------------------------------------------------

def generate_ea(cfg: dict, ea_name: str) -> str:
    magic = abs(hash(cfg["symbol"])) % 90000000 + 10000000
    repl = {
        "@@EANAME@@": ea_name,
        "@@GENDATE@@": _dt.date.today().isoformat(),
        "@@MODE_RAW@@": cfg["mode_raw"],
        "@@FRAMEWORK_RAW@@": cfg["framework_raw"],
        "@@STRATEGY_MODULE@@": cfg["strategy_module"],
        "@@SYMBOL@@": cfg["symbol"],
        "@@CURRENCY@@": cfg["currency"],
        "@@MAX_TRADE_LOSS@@": f'{cfg["max_trade_loss"]:.1f}',
        "@@DAILY_LOSS_LIMIT@@": f'{cfg["daily_loss_limit"]:.1f}',
        "@@MIN_RR@@": f'{cfg["min_rr"]:.2f}',
        "@@MAX_CONTRACTS@@": f'{cfg["max_contracts"]:.2f}',
        "@@PROFIT_TARGET@@": f'{cfg["profit_target"]:.1f}',
        "@@AUTO_ALLOWED@@": "true" if cfg["auto_allowed"] else "false",
        "@@MAGIC@@": str(magic),
    }
    out = MQL5_TEMPLATE
    for k, v in repl.items():
        out = out.replace(k, v)
    return out


def main():
    ap = argparse.ArgumentParser(description="把交易 prompt 翻譯成 MT5 EA (.mq5)")
    ap.add_argument("prompt", help="輸入的 prompt markdown/txt 檔")
    ap.add_argument("-o", "--out", help="輸出 .mq5 路徑")
    args = ap.parse_args()

    if not os.path.exists(args.prompt):
        sys.exit(f"找不到 prompt 檔: {args.prompt}")

    with open(args.prompt, encoding="utf-8") as f:
        prompt = f.read()

    cfg = parse_prompt(prompt)
    ea_name = f'{cfg["symbol"]}_{cfg["strategy_module"]}_EA'
    out_path = args.out or f"{ea_name}.mq5"
    os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)

    code = generate_ea(cfg, ea_name)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(code)

    print("=== 解析結果 ===")
    for k, v in cfg.items():
        print(f"  {k:18}: {v}")
    print(f"\n已產生 EA: {out_path}")
    if not cfg["auto_allowed"]:
        print("注意: prompt 模式未授權自動下單，EA 預設只在 Strategy Tester 內運作。")


if __name__ == "__main__":
    main()
