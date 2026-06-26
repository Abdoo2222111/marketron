"""
Response formatter utilities for consistent API output.
"""
from __future__ import annotations

import json
import logging
import re
from datetime import datetime
from typing import Any, Dict, Optional, Type, TypeVar

from pydantic import BaseModel

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


def extract_json_from_llm_response(text: str) -> Optional[Dict[str, Any]]:
    """
    Extract JSON object from LLM response text.
    Handles markdown code blocks, trailing text, etc.
    """
    # Try to find JSON in markdown code blocks first
    json_pattern = r"```(?:json)?\s*([\s\S]*?)```"
    matches = re.findall(json_pattern, text)

    if matches:
        for match in matches:
            try:
                return json.loads(match.strip())
            except json.JSONDecodeError:
                continue

    # Try direct JSON parse
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        pass

    # Try to find {...} or [{...}] patterns
    brace_pattern = r"(\{[\s\S]*\}|\[[\s\S]*\])"
    brace_matches = re.findall(brace_pattern, text)
    for match in brace_matches:
        try:
            return json.loads(match)
        except json.JSONDecodeError:
            continue

    return None


def parse_llm_response_to_model(
    text: str,
    model_class: Type[T],
    fallback: Optional[Dict[str, Any]] = None,
) -> T:
    """
    Parse LLM response text into a Pydantic model.

    Args:
        text: Raw LLM response
        model_class: Target Pydantic model class
        fallback: Default values if parsing fails

    Returns:
        Instance of model_class
    """
    data = extract_json_from_llm_response(text)

    if data is None:
        if fallback:
            logger.warning(
                f"Could not parse LLM response as JSON, using fallback. "
                f"Response preview: {text[:200]}..."
            )
            return model_class(**fallback)
        raise ValueError(
            f"Failed to parse LLM response as JSON for {model_class.__name__}. "
            f"Response: {text[:500]}"
        )

    try:
        return model_class(**data)
    except Exception as e:
        if fallback:
            logger.warning(
                f"LLM response validation failed for {model_class.__name__}: {e}. "
                f"Using fallback."
            )
            return model_class(**fallback)
        raise


def build_api_response(
    data: Any,
    processing_time_ms: float,
    tokens_used: Optional[int] = None,
    model_used: Optional[str] = None,
    error: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Build a standardized API response.

    Args:
        data: Response data
        processing_time_ms: Processing time in milliseconds
        tokens_used: Approximate tokens used
        model_used: Model identifier
        error: Error message if any

    Returns:
        Standardized response dict
    """
    response = {
        "success": error is None,
        "data": data if error is None else None,
        "error": error,
        "processing_time_ms": round(processing_time_ms, 2),
        "tokens_used": tokens_used,
        "model_used": model_used,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }
    return response


def build_llm_prompt(
    system_template: str,
    user_template: str,
    **kwargs: Any,
) -> tuple[str, str]:
    """
    Build system and user prompts from templates.

    Args:
        system_template: System prompt template with {placeholders}
        user_template: User prompt template with {placeholders}
        **kwargs: Values to fill templates

    Returns:
        Tuple of (system_prompt, user_prompt)
    """
    system_prompt = system_template.format(**kwargs)
    user_prompt = user_template.format(**kwargs)
    return system_prompt, user_prompt
