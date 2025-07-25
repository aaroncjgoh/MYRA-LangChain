import uuid
from langchain_core.tools import tool
import pandas as pd
import app.services.portfolio as portfolio_service
from typing import List, Dict, Any, Union
from fredapi import Fred
from dotenv import load_dotenv
import os
import ssl
import certifi
import urllib.request
import matplotlib.pyplot as plt

from app.firebase_config import db
from google.cloud import firestore

load_dotenv()

FRED_API_KEY = os.getenv("FRED_API_KEY")
FIRESTORE_COLLECTION_NAME = os.getenv("FIRESTORE_COLLECTION_NAME")

# Method to store results in Firebase
def save_to_firestore(tool_result: Dict[str, Union[str, float, List[Dict[str, Any]]]]):
    """
    Stores the structured output of an AI tool to a Firestore collection.
    It uses the 'db' object imported from firebase_config.
    """
    # Check if db was successfully initialized
    if db is None:
        print("Firestore client (db) is not available. Firebase initialization might have failed.")
        return None

    try:
        # The name of the Firestore collection where tool outputs will be stored
        print("hits try block")
        collection_ref = db.collection(FIRESTORE_COLLECTION_NAME)
        tool_result['timestamp'] = pd.Timestamp.now().isoformat()
        
        print("saved timestamp")  # Add a timestamp to the result
        update_time, doc_ref = collection_ref.add(tool_result)
        print(f"Successfully stored tool output to Firestore.")
        print(f"Document ID: {doc_ref.id}")
        print(f"Document path: {doc_ref.path}")
        print(f"Last updated: {update_time}")
        return doc_ref.id
    except Exception as e:
        print(f"Error storing tool output to Firestore: {e}")
        return None

def get_most_recent_backtest():
    """
    Retrieves the most recent document from the 'backtest_outputs' collection
    based on the 'timestamp' field.
    """
    if db is None:
        print("Firestore client (db) is not available. Cannot retrieve data.")
        return None

    # Changed collection name to match your screenshot's "backtest_outputs"
    collection_ref = db.collection(FIRESTORE_COLLECTION_NAME)

    try:
        # Create a query to get documents, ordered by 'timestamp' descending, and limit to 1
        # IMPORTANT: Firestore requires an index for queries that order by a field
        # and then filter/limit. If you encounter an error about missing index,
        # Firebase will provide a link in the error message to create it in the console.
        query = collection_ref.order_by(
            "timestamp", direction=firestore.Query.DESCENDING
        ).limit(1)

        docs = query.stream() # Get the results as a stream

        most_recent_doc = None
        for doc in docs:
            # There should only be one document due to .limit(1)
            most_recent_doc = doc.to_dict()
            print(f"\nFound most recent document (ID: {doc.id}):")
            break # Exit loop after finding the first (and only) document

        if most_recent_doc:
            return most_recent_doc
        else:
            print(f"No documents found in collection '{FIRESTORE_COLLECTION_NAME}'.")
            return None

    except Exception as e:
        print(f"Error retrieving most recent tool output from Firestore: {e}")
        return None

# Method to Generate pd.DataFrame for Backtesting
def generate_backtest_dataframe(start_date: str, end_date: str) -> pd.Series:
    """
    Generate a DataFrame for backtesting purposes.
    
    Args:
        start_date (str): The start date for the backtest in 'YYYY-MM-DD' format.
        end_date (str): The end date for the backtest in 'YYYY-MM-DD' format.
    
    Returns:
        pd.DataFrame: A DataFrame with dates and corresponding values.
    """
    # Create a date range
    dates = pd.date_range(start=start_date, end=end_date, freq='D')
    
    # 2. Extract the day of the week name
    day_names = dates.day_name()

    # 3. Create a Series with dates as index and day names as values
    date_day_series = pd.Series(day_names, index=dates)

    return date_day_series

# Strategies should be implemented as tools and they should return a panda dataframe of the performance of the strategy
@tool
async def intra_week_short(start_date: str, end_date: str, short_day: List[str], cover_day: List[str], ticker: str) -> Dict[str, Union[str, float, List[Dict[str, Any]]]]:
    """
    Backtest an intra-week trading strategy of shorting a ticker and covering that short in the same week. 
    Tell the user the performance of the strategy, such as the total PNL percentage, total PNL in USD, total deposited to execute the trade. 
    This strategy will be completed over the specified date range.
    This is a trading strategy.
    
    Args:
        start_date (str): The start date for the backtest in 'YYYY-MM-DD' format.
        end_date (str): The end date for the backtest in 'YYYY-MM-DD' format.
        short_day (str): The day of the week to buy (e.g., 'Monday').
        cover_day (str): The day of the week to sell (e.g., 'Friday').
        ticker (str): The ticker that we want to trade (e.g., 'USDPHP=X')
    
    Returns an Object that contains:
        Description: A string describing the backtest
        Overall performance percentage: A percentage representing the overall performance of the strategy
        Portfolio History: A pd.Dataframe that logs daily portfolio information
        Completed Trades: A pd.Dataframe that logs the completed trades, as well as the PNL of each completed trade

    """

    print(start_date)
    print(end_date)
    print(short_day)
    print(cover_day)
    print(ticker)

    # Initialize portfolio
    portfolio = portfolio_service.Portfolio(initial_cash=10000)
    time_frame = generate_backtest_dataframe(start_date, end_date)

    for date, day in time_frame.items():
        try:
            if day in short_day:
                portfolio.short(date, ticker, 10000, OHLCV_data='Open')

            elif day in cover_day:
                portfolio.cover_short(date, ticker, OHLCV_data='Open')

        except Exception as e:
            print(f"⚠️ Skipping {date} due to error: {e}")
            continue

        finally:
            portfolio.log_portfolio(date)

    pnl_percentage = portfolio.get_total_return(end_date)
    print(f"Total PNL Percentage: {pnl_percentage}")
    
    output = {
            "description": f"Intra-week short strategy from {start_date} to {end_date} for ticker {ticker}.",
            "overall_performance_percentage": pnl_percentage,
            "portfolio_history": portfolio.portfolio_history,
            "trade_history": portfolio.trade_history,
            "completed_trades": portfolio.completed_trades
        }

    # Save the output to Firestore
    save_to_firestore(output)
    
    return output

@tool
async def intra_week_long(start_date: str, end_date: str, long_day: List[str], close_day: List[str], ticker: str) -> Dict[str, Union[str, float, List[Dict[str, Any]]]]:
    """
    Backtest an intra-week trading strategy of longing a ticker and closing that long in the same week.
    Tell the user the performance of the strategy, such as the total PNL percentage, total PNL in USD, total deposited to execute the trade.
    This strategy will be completed over the specified date range.
    This is a trading strategy.
    
    Args:
        start_date (str): The start date for the backtest in 'YYYY-MM-DD' format.
        end_date (str): The end date for the backtest in 'YYYY-MM-DD' format.
        long_day (str): The day of the week to buy (e.g., 'Monday').
        close_day (str): The day of the week to sell (e.g., 'Friday').
        ticker (str): The ticker that we want to trade (e.g., 'USDPHP=X')
    
    Returns an Object that contains:
        Description: A string describing the backtest
        Overall performance percentage: A percentage representing the overall performance of the strategy
        Portfolio History: A pd.Dataframe that logs daily portfolio information
        Completed Trades: A pd.Dataframe that logs the completed trades, as well as the PNL of each completed trade
    """

    print(start_date)
    print(end_date)
    print(long_day)
    print(close_day)
    print(ticker)

    # Initialize portfolio
    portfolio = portfolio_service.Portfolio(initial_cash=10000)
    
    time_frame = generate_backtest_dataframe(start_date, end_date)

    for date, day in time_frame.items():
        if portfolio.cash < 10000:
            portfolio.deposit(date, 10000)

        if day in long_day:
            portfolio.long(date, ticker, 10000, OHLCV_data='Open')

        elif day in close_day:
            portfolio.close_long(date, ticker, OHLCV_data='Open')

        portfolio.log_portfolio(date)


    pnl_percentage = portfolio.get_total_return(end_date)
    print(f"Total PNL Percentage: {pnl_percentage}")

    output = {
            "description": f"Intra-week short strategy from {start_date} to {end_date} for ticker {ticker}.",
            "overall_performance_percentage": pnl_percentage,
            "portfolio_history": portfolio.portfolio_history,
            "trade_history": portfolio.trade_history,
            "completed_trades": portfolio.completed_trades
        }
    
    # Save the output to Firestore
    save_to_firestore(output)
    
    return output

# Define additional tools to intepret the Historical Data of the Portfolio
@tool
async def analyse_hit_rate(rate: str="M") -> Dict[str, Union[List[Dict[str, Any]], float]]: # Need to use firebase to store the memory of the completed trades
    """
    After backtesting a strategy and obtaining the respective dataframes, make use of the completed_trades dataframe to analyse the number of winning trades.
    This analysis should be done on the MOST RECENTLY BACKTESTED strategy.
    A winning trade is defined as a trade where the PNL is greater than 0.

    Take in a rate at which to calculate the hit rate, eg. (D: Daily, W: Weekly, M: Monthly, Q: Quarterly, Y: Yearly)
    """
    print(rate)

    most_recent_backtest = get_most_recent_backtest()

    if most_recent_backtest is not None:
        completed_trades_df = pd.DataFrame(most_recent_backtest.get("completed_trades", []))

        completed_trades_df['date'] = pd.to_datetime(completed_trades_df['date'], format='%Y-%m-%d')
        completed_trades_df["is_win"] = completed_trades_df["pnl"] > 0

        summary = completed_trades_df.groupby(pd.Grouper(key='date', freq=rate)).agg(
            total_trades=('pnl', 'count'),
            wins=('is_win', 'sum')
        )

        summary.index = summary.index.strftime('%Y-%m')
        summary['hit_ratio'] = summary['wins'] / summary['total_trades']    

        return {
            "summary": summary.to_dict('records'),
            "overall_hit_rate": summary['hit_ratio'].mean() if not summary.empty else 0.0
        }
    
    else:
        return {
            "error": ["No backtest data available. Please run a backtest first."]
        }
    
@tool
async def plot_hit_rate(rate: str="M") -> Dict[str, Union[List[Dict[str, Any]], float]]:
    """
    After backtesting a strategy and obtaining the respective dataframes, make use of the completed_trades dataframe to plot the hit rate.
    
    The output should looks like this:
    "Here is the hit ratio plot for the recent strategy: ![Hit Ratio Plot](http://localhost:8000/static/images/hit_ratio_plot_26f91791416e4cab846b1ab1778cae84.png)"
    Do not forget the localhost URL, as this is where the plot will be served from.
    
    A winning trade is defined as a trade where the PNL is greater than 0.
    Take in a rate at which to calculate the hit rate, eg. (D: Daily, W: Weekly, M: Monthly, Q: Quarterly, Y: Yearly)
    """
    print(rate)

    most_recent_backtest = get_most_recent_backtest()

    if most_recent_backtest is not None:
        completed_trades_df = pd.DataFrame(most_recent_backtest.get("completed_trades", []))

        completed_trades_df['date'] = pd.to_datetime(completed_trades_df['date'], format='%Y-%m-%d')
        completed_trades_df["is_win"] = completed_trades_df["pnl"] > 0

        summary = completed_trades_df.groupby(pd.Grouper(key='date', freq=rate)).agg(
            total_trades=('pnl', 'count'),
            wins=('is_win', 'sum')
        )

        summary.index = summary.index.strftime('%Y-%m')
        summary['hit_ratio'] = summary['wins'] / summary['total_trades']
    
    print("Got hit rate data")
    hit_rate_df = pd.DataFrame(summary)
    print(hit_rate_df.head())

    try:
    # Check if DataFrame is not empty
        if hit_rate_df.empty:
            raise ValueError("hit_rate_df is empty. Cannot generate plot.")

        # Ensure static/images directory exists
        download_dir = "app/static/images"
        os.makedirs(download_dir, exist_ok=True)

        # Plot
        print("Creating hit rate plot...")
        hit_rate_df['hit_ratio'].plot(kind='bar', title='Hit Ratio Over Time', figsize=(12, 6))
        plt.xlabel('Date')
        plt.ylabel('Hit Ratio')
        plt.axhline(y=0.5, color='gray', linestyle='--', linewidth=0.8, zorder=0)

        # Save
        filename = f"hit_ratio_plot_{uuid.uuid4().hex}.png"
        filepath = os.path.join(download_dir, filename)
        print(f"Saving plot to {filepath}...")
        plt.savefig(filepath, bbox_inches="tight")
        plt.close()
        print("Plot saved successfully.")
        print(f"Hit rate plot saved at {filepath}")

    except Exception as e:
        print("An error occurred while generating/saving the plot:", e)

    return {
        "image_url": f"static/images/{filename}",
        "description": f"Hit rate plot saved at {filename}"
    }

@tool
async def analyse_completed_trades() -> Dict[str, Union[List[Dict[str, Any]], float]]: # Need to use firebase to store the memory of the completed trades
    """
    After backtesting a strategy and obtaining the respective dataframes, make use of the completed_trades dataframe to analyse the PNL of completed trades.
    This analysis should be done on the MOST RECENTLY BACKTESTED strategy.
    """

    most_recent_backtest = get_most_recent_backtest()

    if most_recent_backtest is not None:
        completed_trades_df = pd.DataFrame(most_recent_backtest.get("completed_trades", []))

        completed_trades_df['date'] = pd.to_datetime(completed_trades_df['date'], format='%Y-%m-%d')
        average_pnl = completed_trades_df['pnl'].mean() if not completed_trades_df.empty else 0.0

        return {
            "summary": completed_trades_df.to_dict('records'),
            "average_pnl": average_pnl
        }
    
    else:
        return {
            "error": ["No backtest data available. Please run a backtest first."]
        }
    
@tool
async def analyse_sharpe_ratio():
    """
    Analyzes the risk-adjusted performance of the most recently completed backtest by calculating the Sharpe Ratio. This ratio compares the strategy's average daily return (in excess of the 3-month U.S. Treasury Bill rate) to its return volatility.

    It retrieves:

        Daily returns from the portfolio history
        Daily risk-free rate using FRED’s DTB3 (3-month Treasury Bill)
        Computes daily excess returns, their mean, and standard deviation
        Returns the annualized Sharpe Ratio, assuming 252 trading days/year

    Use this tool to evaluate whether a trading strategy is producing strong returns relative to the risk taken.
    """

    most_recent_backtest = get_most_recent_backtest()

    if most_recent_backtest is not None:
        # Get the series of daliy returns
        print("Getting daily returns...")
        daily_portfolio_df = pd.DataFrame(most_recent_backtest.get("portfolio_history", []))
        daily_portfolio_df['date'] = daily_portfolio_df['date'].dt.strftime('%Y-%m-%d')
        
        start_date = daily_portfolio_df['date'].min()
        end_date = daily_portfolio_df['date'].max()
        print(f"Start Date: {start_date} {type(start_date)}, End Date: {end_date} {type(end_date)}")
        
        daily_portfolio_df.set_index('date', inplace=True)

        daily_returns = daily_portfolio_df['daily_return'].dropna() / 100
        print(daily_returns.head())

        # Get Daily Risk-Free Rate
        print("Getting daily risk-free rate...")
        fred = Fred(api_key=FRED_API_KEY)
        ssl._create_default_https_context = lambda: ssl.create_default_context(cafile=certifi.where())
        t_bill_3m_rate = fred.get_series('DTB3', observation_start=start_date, observation_end=end_date) / 100
        t_bill_3m_rate.index = pd.to_datetime(t_bill_3m_rate.index).strftime('%Y-%m-%d')
        print("Got T-Bill 3M Rate")
        if t_bill_3m_rate is None or t_bill_3m_rate.empty:
            return {
                "error": ["Could not retrieve T-Bill data from FRED. Please check API key or date range."]
            }

        daily_rf_rate = t_bill_3m_rate.apply(lambda annual_rate: (1 + annual_rate) ** (1/252) - 1)
        print(daily_rf_rate.head())

        # Get Daily Excess Returns
        print("Calculating daily excess returns...")
        daily_returns, daily_rf_rate = daily_returns.align(daily_rf_rate, join='inner')
        daily_excess_returns = daily_returns - daily_rf_rate
        print(daily_excess_returns.head())

        mean_daily_excess_return = daily_excess_returns.mean()
        std_daily_return = daily_returns.std()

        # Calculating Sharpe Ratio
        if std_daily_return != 0:
            sharpe_ratio = (mean_daily_excess_return / std_daily_return) * (252 ** 0.5)
            print(f"Sharpe Ratio: {sharpe_ratio}")
            return sharpe_ratio
        
        else:
            return {
                "error": ["Standard deviation of daily returns is zero, cannot calculate Sharpe Ratio."]
            }

    else:
        return {
            "error": ["No backtest data available. Please run a backtest first."]
        }
