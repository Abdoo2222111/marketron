"""
Token counting utilities for cost tracking.
"""
from __future__ import annotations

import logging
from typing import Dict, Optional

from src.config import settings

logger = logging.getLogger(__name__)

# Approximate pricing per 1K tokens (USD)
PRICING: Dict[str, Dict[str, float]] = {
    "gpt-4o-mini": {"input": 0.00015, "output": 0.0006},
    "gpt-4o": {"input": 0.0025, "output": 0.01},
    "claude-3-5-sonnet-20241022": {"input": 0.003, "output": 0.015},
}

# Default pricing if model not found
DEFAULT_INPUT_PRICE = 0.001
DEFAULT_OUTPUT_PRICE = 0.002


def estimate_tokens(text: str) -> int:
    """
    Estimate token count for mixed Arabic/English text.
    Arabic chars are ~2 bytes in UTF-8, English ~1 byte.
    ~4 chars per token is a common heuristic.
    """
    return max(1, len(text) // 4)


def calculate_cost(
    input_tokens: int,
    output_tokens: int,
    model: Optional[str] = None,
) -> float:
    """
    Calculate approximate cost for a request.

    Args:
        input_tokens: Number of input tokens
        output_tokens: Number of output tokens
        model: Model name for pricing lookup

    Returns:
        Cost in USD
    """
    pricing = PRICING.get(model, {})
    input_price = pricing.get("input", DEFAULT_INPUT_PRICE)
    output_price = pricing.get("output", DEFAULT_OUTPUT_PRICE)

    input_cost = (input_tokens / 1000) * input_price
    output_cost = (output_tokens / 1000) * output_price

    return round(input_cost + output_cost, 6)


def format_cost_report(
    total_input_tokens: int,
    total_output_tokens: int,
    model: str,
    request_count: int,
) -> str:
    """Format a cost report for logging."""
    total_cost = calculate_cost(total_input_tokens, total_output_tokens, model)

    return (
        f"📊 Cost Report:\n"
        f"   Requests: {request_count}\n"
        f"   Input tokens: {total_input_tokens:,}\n"
        f"   Output tokens: {total_output_tokens:,}\n"
        f"   Model: {model}\n"
        f"   Estimated cost: ${total_cost:.4f}"
    )
