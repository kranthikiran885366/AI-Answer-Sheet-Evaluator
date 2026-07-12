#!/usr/bin/env python3
"""Standalone evaluation runner for answer sheets"""

import argparse
import asyncio
import json
import os
import sys
from pathlib import Path
from typing import Optional

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.database import db
from backend.evaluation_service import evaluation_service, report_generator
from backend.ocr_engine import OCREngine, EvaluationProcessor


async def run_evaluation(
    eval_id: str,
    image_path: str,
    subject: str,
    session_id: str,
    rubric_str: Optional[str] = None,
) -> Dict:
    """Execute complete evaluation pipeline"""

    try:
        print(f"[RUNNER] Starting evaluation {eval_id}")
        print(f"[RUNNER] Image: {image_path}")
        print(f"[RUNNER] Subject: {subject}")

        # Parse rubric if provided
        rubric = None
        if rubric_str:
            try:
                rubric = json.loads(rubric_str)
            except:
                rubric = None

        # Run evaluation
        result = await evaluation_service.process_evaluation(
            eval_id=eval_id,
            session_id=session_id,
            image_path=image_path,
            subject=subject,
            rubric=rubric,
            ai_provider="auto",
        )

        print(f"[RUNNER] Evaluation completed successfully")
        print(f"[RUNNER] Grade: {result.get('grade', 'N/A')}")
        print(f"[RUNNER] Marks: {result.get('obtainedMarks', 0)}/{result.get('totalMarks', 100)}")

        return result

    except Exception as e:
        print(f"[RUNNER] Error: {str(e)}", file=sys.stderr)
        raise


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Answer Sheet Evaluation Runner")
    parser.add_argument("--eval-id", required=True, help="Evaluation ID")
    parser.add_argument("--image-path", required=True, help="Path to image file")
    parser.add_argument("--subject", required=True, help="Subject")
    parser.add_argument("--session-id", required=True, help="Session ID")
    parser.add_argument("--rubric", help="Rubric JSON string")

    args = parser.parse_args()

    # Validate image exists
    if not os.path.exists(args.image_path):
        print(f"[ERROR] Image file not found: {args.image_path}", file=sys.stderr)
        sys.exit(1)

    try:
        # Run evaluation
        result = asyncio.run(
            run_evaluation(
                eval_id=args.eval_id,
                image_path=args.image_path,
                subject=args.subject,
                session_id=args.session_id,
                rubric_str=args.rubric,
            )
        )

        print(json.dumps({"success": True, "result": result}, indent=2))
        sys.exit(0)

    except Exception as e:
        print(
            json.dumps({"success": False, "error": str(e)}),
            file=sys.stderr,
        )
        sys.exit(1)


if __name__ == "__main__":
    main()
