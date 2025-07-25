from langchain_core.tools import tool
from langchain_core.messages import AIMessage, ToolMessage

from app.tools.math import add, subtract, multiply, exponentiate
import app.tools.backtest as backtest
import app.tools.news as news

@tool
async def final_answer(answer: str, tools_used: list[str]) -> dict[str, str | list[str]]:
    """Use this tool to provide a final answer to the user."""
    return {"answer": answer, "tools_used": tools_used}

tools = [add, subtract, multiply, exponentiate, final_answer, 
         news.getLatestBBCNews, news.getLatestReutersNews, news.getEarningsCalendar,
         backtest.intra_week_long, backtest.intra_week_short, backtest.analyse_hit_rate, backtest.analyse_completed_trades, backtest.analyse_sharpe_ratio,
         backtest.plot_hit_rate]

# note when we have sync tools we use tool.func, when async we use tool.coroutine
name2tool = {tool.name: tool.coroutine for tool in tools}

async def execute_tool(tool_call: AIMessage) -> ToolMessage:
    tool_name = tool_call.tool_calls[0]["name"]
    tool_args = tool_call.tool_calls[0]["args"]
    tool_out = await name2tool[tool_name](**tool_args)
    return ToolMessage(
        content=f"{tool_out}",
        tool_call_id=tool_call.tool_calls[0]["id"]
    )