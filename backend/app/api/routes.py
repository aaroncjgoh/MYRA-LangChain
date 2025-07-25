from http.client import HTTPException
from fastapi import FastAPI, APIRouter, HTTPException, Response 
from fastapi.responses import StreamingResponse
import asyncio
import status
from starlette import status

from app.chains.token_stream import token_generator, QueueCallbackHandler
from google.cloud import firestore
from app.firebase_config import db

router = APIRouter()

@router.post("/invoke")
async def invoke(content: str): # This expects content as a query parameter
    queue: asyncio.Queue = asyncio.Queue()
    streamer = QueueCallbackHandler(queue)
    return StreamingResponse(
        token_generator(content, streamer),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )   

@router.get("/api/most_recent_strategy") # Changed path for consistency with frontend
async def get_most_recent_strategy_endpoint(): # Renamed for clarity
    """
    API endpoint to retrieve the most recent backtested strategy.
    """
    if db is None:
        print("Firestore client (db) is not available. Cannot retrieve data.")
        # Return a 500 Internal Server Error if Firebase isn't initialized
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Backend database not initialized.")

    FIRESTORE_COLLECTION_NAME = "backtest_outputs"
    collection_ref = db.collection(FIRESTORE_COLLECTION_NAME)

    try:
        query = collection_ref.order_by(
            "timestamp", direction=firestore.Query.DESCENDING
        ).limit(1)

        docs = query.stream()

        most_recent_doc = None
        for doc in docs:
            most_recent_doc = doc.to_dict()
            # Convert Firestore Timestamp to ISO format string for JSON serialization
            if 'timestamp' in most_recent_doc and hasattr(most_recent_doc['timestamp'], 'isoformat'):
                most_recent_doc['timestamp'] = most_recent_doc['timestamp'].isoformat()
            break 

        if most_recent_doc:
            # Return data in the format expected by the frontend
            print(f"Most recent strategy retrieved successfully: {most_recent_doc}")
            return {"success": True, "data": most_recent_doc}
        else:
            print(f"No documents found in collection '{FIRESTORE_COLLECTION_NAME}'.")
            # Return a 404 Not Found status if no data is found
            return Response(status_code=status.HTTP_404_NOT_FOUND, content='{"success": false, "message": "No recent strategy found."}', media_type="application/json")

    except Exception as e:
        print(f"Error retrieving most recent tool output from Firestore: {e}")
        # Return a 500 Internal Server Error for other exceptions
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to retrieve strategy: {e}")
