"""
# RevCraft — S3 Data Lake Service
Stores build snapshots and activity logs to S3 with gzip compression.
"""

import json
import gzip
import io
from datetime import datetime, timezone
from config import settings

try:
    import boto3
    from botocore.exceptions import ClientError
except ImportError:
    boto3 = None  # type: ignore


def _get_s3_client():
    """Get S3 client, pointing to LocalStack in dev."""
    if boto3 is None:
        return None

    kwargs = {
        "service_name": "s3",
        "region_name": settings.aws_region,
        "aws_access_key_id": settings.aws_access_key_id,
        "aws_secret_access_key": settings.aws_secret_access_key,
    }
    if settings.s3_endpoint_url:
        kwargs["endpoint_url"] = settings.s3_endpoint_url

    return boto3.client(**kwargs)


def _ensure_bucket(client):
    """Create the bucket if it doesn't exist (for local dev with LocalStack)."""
    try:
        client.head_bucket(Bucket=settings.s3_bucket_name)
    except ClientError:
        try:
            client.create_bucket(Bucket=settings.s3_bucket_name)
        except Exception:
            pass


def _compress_json(data: dict) -> bytes:
    """Gzip-compress a JSON object."""
    json_bytes = json.dumps(data, default=str).encode("utf-8")
    buf = io.BytesIO()
    with gzip.GzipFile(fileobj=buf, mode="wb") as gz:
        gz.write(json_bytes)
    return buf.getvalue()


def store_build_snapshot(user_id: str, build_id: str, config: dict, stats: dict) -> str | None:
    """
    Store a timestamped build snapshot in S3.
    Path: builds/{user_id}/{build_id}/{timestamp}.json.gz
    Returns the S3 key or None if storage failed.
    """
    client = _get_s3_client()
    if client is None:
        return None

    _ensure_bucket(client)

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    key = f"builds/{user_id}/{build_id}/{timestamp}.json.gz"

    snapshot = {
        "user_id": user_id,
        "build_id": build_id,
        "timestamp": timestamp,
        "config": config,
        "stats": stats,
    }

    try:
        compressed = _compress_json(snapshot)
        client.put_object(
            Bucket=settings.s3_bucket_name,
            Key=key,
            Body=compressed,
            ContentType="application/json",
            ContentEncoding="gzip",
        )
        return key
    except Exception:
        return None


def store_activity_log(user_id: str, action: str, metadata: dict | None = None) -> str | None:
    """
    Store a user activity log entry in S3.
    Path: logs/{user_id}/{date}/{timestamp}_{action}.json.gz
    """
    client = _get_s3_client()
    if client is None:
        return None

    _ensure_bucket(client)

    now = datetime.now(timezone.utc)
    date_str = now.strftime("%Y-%m-%d")
    timestamp = now.strftime("%Y%m%dT%H%M%SZ")
    key = f"logs/{user_id}/{date_str}/{timestamp}_{action}.json.gz"

    log_entry = {
        "user_id": user_id,
        "action": action,
        "timestamp": now.isoformat(),
        "metadata": metadata or {},
    }

    try:
        compressed = _compress_json(log_entry)
        client.put_object(
            Bucket=settings.s3_bucket_name,
            Key=key,
            Body=compressed,
            ContentType="application/json",
            ContentEncoding="gzip",
        )
        return key
    except Exception:
        return None
