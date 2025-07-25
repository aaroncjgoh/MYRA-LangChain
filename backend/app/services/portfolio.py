from collections import defaultdict
import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta

class Portfolio:
    def __init__(self, initial_cash=10000):
        self.cash = initial_cash
        self.positions = defaultdict(dict)
        # Positions format:
        # self.positions = {
        #   "ticker" : (qty owned, avg price, cumulative_qty) # Need average price to calculate P&L -> store as a dict
        # }
        self.trade_history = [] # Used to log all trades and actions taken in the portfolio
        # History format:
        # self.history = [
        #     {
        #         'date': '2022-01-01',
        #         'action': 'long' or 'close_long',
        #         'ticker': 'USDPHP=X',
        #         'volume': 1000,
        #         'price': 50.0,
        #         'cash_remaining': 5000,
        #         'portfolio_value': 10000
        #         'total_realised_pnl': 0 # This is the total realised P&L for the portfolio
        #   
        #     },
        self.completed_trades = []
        # Completed trades format:
        # self.completed_trades = [
        #     {
        #         'date': '2022-01-01',
        #         'action': 'long' or 'close_long',
        #         'ticker': 'USDPHP=X',
        #         'volume': 1000,
        #         'price': 50.0,
        #         'pnl': 5000,
        #     }
        self.portfolio_history = [] # Used to log portfolio at the end of each day
        # 'cash_remaining': self.cash,
        # "portfolio_value": self.get_portfolio_value(date),
        # "total_realised_pnl": self.total_realised_pnl # Record total realised P&L

        self.total_realised_pnl = 0

        self.deposited_cash = initial_cash
        self.deposited_cash_history = {}


    def long(self, date, ticker, volume, OHLCV_data='Open'):        
        if self.cash >= volume and volume > 0:
            ticker_value = Portfolio.get_ticker_value(date, ticker, OHLCV_data)
            
            if ticker_value is None:
                print(f"[WARN] No {OHLCV_data} price for {ticker} on {date}. Skipping long.")
                self.no_trade(date)  # or just return
                return

            # Check if you already have a position in this ticker
            if ticker in list(self.positions.keys()):
                # If you already have a position, add to it and fix average price
                current_quantity = self.positions[ticker]["qty"]
                long_quantity = volume / ticker_value

                # Check for Short position
                if current_quantity < 0:
                    if long_quantity > abs(current_quantity):
                        remaining_quantity = long_quantity + current_quantity
                        self.cover_short(date, ticker, volume_to_cover=(-current_quantity * ticker_value))
                        self.long(date, ticker, volume=(remaining_quantity * ticker_value))
                        print(f"[{date}] INFO: Closed short position for {ticker} and opened long position for {remaining_quantity * ticker_value}.")
                        return
                    
                    else:
                        self.cover_short(date, ticker, volume_to_cover=volume)
                        return

                else:
                    current_value = self.positions[ticker]["avg_price"] * current_quantity
                    self.positions[ticker]["qty"] += long_quantity
                    self.positions[ticker]["avg_price"] = (current_value + volume) / self.positions[ticker]["qty"]
                    self.positions[ticker]["cumulative_qty"] += long_quantity           

                if self.positions[ticker]["qty"] == 0:
                    del self.positions[ticker]
            else:
                # If not, create a new position
                self.positions[ticker]["qty"] = volume / ticker_value
                self.positions[ticker]["avg_price"] = ticker_value
                self.positions[ticker]["realised_pnl_cumulative"] = 0
                self.positions[ticker]["cumulative_qty"] = volume / ticker_value

            # Update cash
            self.cash -= volume 

            # Record the transaction in history
            self.trade_history.append({
                'date': date,
                'action': 'long',
                'ticker': ticker,
                'volume': volume,
                'price': ticker_value,
            })
        else:
            print("Not enough cash to long / Negative Volume Detected")
        
        return

    def close_long(self, date, ticker, volume_to_close=None, OHLCV_data='Open'):
        """
        Closes a long position for a given ticker.
        If volume_to_close is None, the entire position is closed.
        Otherwise, attempts to close the specified volume.
        """
        # 1. Check if there's an active long position for the ticker
        if ticker not in list(self.positions.keys()) or self.positions[ticker]["qty"] <= 0:
            print(f"[{date}] INFO: No active long position found for {ticker} to close.")
            return

        current_quantity_held = self.positions[ticker]["qty"]
        ticker_value = Portfolio.get_ticker_value(date, ticker, OHLCV_data) # Using 'Open' for transaction price
        if ticker_value is None:
                print(f"[WARN] No {OHLCV_data} price for {ticker} on {date}. Skipping long.")
                self.no_trade(date)  # or just return
                return
        
        # 2. Determine the actual quantity to close based on volume_to_close
        actual_volume_to_close = 0
        if volume_to_close is None:
            actual_volume_to_close = abs(current_quantity_held) * ticker_value # Close entire position
        else:
            # Validate specified volume
            if volume_to_close <= 0:
                print(f"[{date}] WARNING: Invalid volume specified for {ticker}. Volume must be positive. No action taken.")
                return
            if volume_to_close > current_quantity_held * ticker_value:
                print(f"[{date}] WARNING: Attempting to close ${volume_to_close} of {ticker}, but only {current_quantity_held * ticker_value} units are held. Closing entire position instead.")
                actual_volume_to_close = current_quantity_held * ticker_value
            else:
                actual_volume_to_close = volume_to_close

        # 4. Update cash and pnl
        pnl_per_ticker = self.get_ticker_pnl(date, ticker)
        
        if pnl_per_ticker is None:
            print(f"[{date}] WARNING: Unable to calculate P&L for {ticker}. Unable to close long. Will not execute trade.")
            self.no_trade(date)
            return

        pnl = pnl_per_ticker * (actual_volume_to_close/ticker_value)
        self.cash += actual_volume_to_close
        self.total_realised_pnl += pnl
        self.positions[ticker]["realised_pnl_cumulative"] += pnl

        # 5. Update position quantity
        self.positions[ticker]["qty"] -= actual_volume_to_close / ticker_value
        if self.positions[ticker]["qty"] <= 01e-9:
            print(f"[{date}] INFO: Successfully fully closed long position for {ticker}.")
            total_invested = self.positions[ticker]["avg_price"] * abs(self.positions[ticker]["cumulative_qty"])
            self.completed_trades.append({
                'date': date,
                'action': 'close_long',
                'ticker': ticker,
                'pnl': self.positions[ticker]["realised_pnl_cumulative"],
                'pnl_percentage': (self.positions[ticker]["realised_pnl_cumulative"] / total_invested) * 100 if total_invested != 0 else 0
            })
            del self.positions[ticker] # Remove ticker from positions dict
        else:
            print(f"[{date}] INFO: Successfully partially closed long position for {ticker}. Remaining: {self.positions[ticker]['qty']} units.")

        # 6. Record history
        self.trade_history.append({
            'date': date,
            'action': 'close_long',
            'ticker': ticker,
            'volume': actual_volume_to_close,
            'price': ticker_value,
        })
        
        return

    def short(self, date, ticker, volume, OHLCV_data='Open'):
        # Based on Interactive Brokers, need to maintain a minimum of 150% worth of the shorted position in cash. But elsewhere, it is not really specified.
        # Will assume that we just need the cash to cover the shorted position (and when you sell the stock you get cash but end up with a negative position)
        if volume >0:
            ticker_value = Portfolio.get_ticker_value(date, ticker, OHLCV_data)
            
            if ticker_value is None:
                print(f"[WARN] No {OHLCV_data} price for {ticker} on {date}. Skipping short.")
                self.no_trade(date)  # or just return
                return

            # Check if you already have a position in this ticker
            if ticker in list(self.positions.keys()):
                current_quantity = self.positions[ticker]['qty']
                short_quantity = volume / ticker_value

                # Check for long position
                if current_quantity > 0:
                    if short_quantity > current_quantity:
                        remaining_quantity = short_quantity - current_quantity
                        self.close_long(date, ticker, volume_to_close=(current_quantity * ticker_value))
                        self.short(date, ticker, volume=(remaining_quantity * ticker_value))
                        return

                    else:
                        self.close_long(date, ticker, volume_to_close=volume)
                        return

                else:
                    current_value = self.positions[ticker]["avg_price"] * -current_quantity
                    self.positions[ticker]["qty"] -= short_quantity 
                    self.positions[ticker]["avg_price"] = (current_value + volume) / -self.positions[ticker]["qty"]
                    self.positions[ticker]["cumulative_qty"] -= short_quantity 
                
                if self.positions[ticker]['qty'] == 0:
                    del self.positions[ticker]
            else:
                # If not, create a new position (negative position for shorting)
                self.positions[ticker]['qty'] = -(volume / ticker_value)
                self.positions[ticker]['avg_price'] = ticker_value
                self.positions[ticker]["realised_pnl_cumulative"] = 0
                self.positions[ticker]['cumulative_qty'] = -(volume / ticker_value)

            # Update cash
            self.cash += volume

            # Record the transaction in history
            self.trade_history.append({
                'date': date,
                'action': 'short',
                'ticker': ticker,
                'volume': volume,
                'price': ticker_value,
            })

        else:
            print("Not enough collateral to short. / Volume is negative")

        return
    
    def cover_short(self, date, ticker, volume_to_cover=None, OHLCV_data='Open'):
        """
        Covers a short position for a given ticker.
        If volume_to_cover is None, the entire position is covered.
        Otherwise, attempts to cover the specified volume.
        """
        # 1. Check if there's an active short position for the ticker
        if ticker not in list(self.positions.keys()) or self.positions[ticker]['qty'] >= 0:
            print(f"[{date}] INFO: No active short position found for {ticker} to cover.")
            return

        current_quantity_shorted = -self.positions[ticker]['qty']
        ticker_value = Portfolio.get_ticker_value(date, ticker, OHLCV_data)
        max_coverable_volume = abs(current_quantity_shorted) * ticker_value
        
        if ticker_value is None:
            print(f"[WARN] No {OHLCV_data} price for {ticker} on {date}. Skipping long.")
            self.no_trade(date)  # or just return
            return
        
        if volume_to_cover is None:
            actual_volume_to_cover = max_coverable_volume
        else:
            # Validate specified volume
            if volume_to_cover <= 0:
                print(f"[{date}] WARNING: Invalid volume specified for {ticker}. Volume must be positive. No action taken.")
                return
            if volume_to_cover > max_coverable_volume:
                print(f"[{date}] WARNING: Attempting to cover ${volume_to_cover} of {ticker}, but only ${max_coverable_volume} of {ticker} are shorted. Covering entire position instead.")
                actual_volume_to_cover = max_coverable_volume
            else:
                actual_volume_to_cover = volume_to_cover

        # Update Cash and pnl
        pnl_per_ticker = -self.get_ticker_pnl(date, ticker)
        if pnl_per_ticker is None:
            print(f"[{date}] WARNING: Unable to calculate P&L for {ticker}. Unable to cover short. Will not execute trade.")
            self.no_trade(date)
            return
        pnl = pnl_per_ticker * (actual_volume_to_cover/ticker_value)
        self.cash -= actual_volume_to_cover
        self.total_realised_pnl += pnl
        self.positions[ticker]["realised_pnl_cumulative"] += pnl

        # Update position quantity
        self.positions[ticker]['qty'] += actual_volume_to_cover / ticker_value
        if abs(self.positions[ticker]['qty']) <= 1e-9:
            print(f"[{date}] INFO: Successfully fully closed short position for {ticker}.")
            total_invested = self.positions[ticker]["avg_price"] * abs(self.positions[ticker]["cumulative_qty"])
            self.completed_trades.append({
                'date': date,
                'action': 'cover_short',
                'ticker': ticker,
                'pnl': self.positions[ticker]["realised_pnl_cumulative"],
                'pnl_percentage': (self.positions[ticker]["realised_pnl_cumulative"] / total_invested) * 100 if total_invested != 0 else 0
            })
            del self.positions[ticker]
        else:
            print(f"[{date}] INFO: Successfully partially closed long position for {ticker}. Remaining: {self.positions[ticker]['qty']} units.")

        # Record history
        self.trade_history.append({
            'date': date,
            'action': 'cover_short',
            'ticker': ticker,
            'volume': actual_volume_to_cover,
            'price': ticker_value,
        })

        return


    def get_portfolio_value(self, date):
        total_value = self.cash
        
        for ticker, data in self.positions.items():
            ticker_value = Portfolio.get_ticker_value(date, ticker, 'Open')
            if ticker_value is None:
                print(f"[WARN] No Open price for {ticker} on {date}. Unable to calculate value.")
                return None
            total_value += data['qty'] * ticker_value
        
        return total_value
    
    def get_ticker_pnl(self, date, ticker):
        ticker_data = self.positions.get(ticker)
        if ticker_data is None:
            print(f"{ticker} is not in your portfolio")
            return
        else:
            ticker_value = Portfolio.get_ticker_value(date, ticker, 'Open')
            
            if ticker_value is None:
                    print(f"[WARN] No price for {ticker} on {date}. Unable to get value.")
                    self.no_trade(date)  # or just return
                    return None
            
            pnl = ticker_value - ticker_data['avg_price']

            return pnl

    def no_trade(self, date): # Might not even need this method now (But just keep in case)
        """
        This method is to update the history when no trade action is taken.
        """
        portfolio_value = self.get_portfolio_value(date)

        while portfolio_value is None:
            date_obj = datetime.strptime(date, "%Y-%m-%d")
            print(f"[{date_obj.date()}] WARNING: Unable to calculate portfolio value. Falling back to previous day.")
            date_obj -= timedelta(days=1)
            date = date_obj.strftime("%Y-%m-%d")
            portfolio_value = self.get_portfolio_value(date)

        self.trade_history.append({
            'date': date,
            'action': 'no_trade',
            'ticker': None,
            'volume': None,
            'price': None,
        })

    def deposit(self, date, amount):
        if amount <= 0:
            print(f"[{date}] WARNING: Deposit must be positive.")
            return

        self.cash += amount
        self.deposited_cash += amount
        self.deposited_cash_history[date] = amount
    
    def get_total_return(self, date):
        net_value = self.get_portfolio_value(date)
        return ((net_value - self.deposited_cash) / self.deposited_cash) * 100
    
    def log_portfolio(self, date):
        """
        Log the portfolio state at the end of the day.
        """
        portfolio_value = self.get_portfolio_value(date)
        if portfolio_value is None:
            print(f"[{date}] WARNING: Unable to log portfolio value. No data available.")
            return
        
        # Find the adjusted returns (Accounting for first day when return is 0)

        if self.portfolio_history == []:
            adjusted_return = 0

        else: 
            deposits_today = self.deposited_cash_history.get(date, 0)
            previous_value = self.portfolio_history[-1]['portfolio_value']
            adjusted_return = ((portfolio_value - previous_value - deposits_today) / previous_value) * 100 if previous_value != 0 else 0
        
        self.portfolio_history.append({
            'date': date,
            'cash_remaining': self.cash,
            'portfolio_value': portfolio_value,
            'daily_return': adjusted_return,
            'total_realised_pnl': self.total_realised_pnl
        })
        
        # 'cash_remaining': self.cash,
        # "portfolio_value": self.get_portfolio_value(date),
        # "total_realised_pnl": self.total_realised_pnl # Record total realised P&L

    @staticmethod
    def get_ticker_value(date, ticker, price_type: str = 'Open'):
        try:
            start_date_obj = pd.to_datetime(date)
            end_date_obj = start_date_obj + pd.Timedelta(days=1)

            data = yf.download(
                ticker,
                start=start_date_obj.strftime('%Y-%m-%d'),
                end=end_date_obj.strftime('%Y-%m-%d'),
                progress=False,
                auto_adjust=False
            )

            if data.empty:
                return None

            return data.loc[start_date_obj.strftime('%Y-%m-%d'), price_type].item()
        


        except KeyError:
            print(f"❌ Error: Price type '{price_type}' not found in data for {ticker} on {date}.")
            return None

        except Exception as e:
            print(f"❌ Exception for {ticker} on {date}: {e}")
            return None
