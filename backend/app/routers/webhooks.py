import uuid
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from deepguard_db.app.db.database import get_db
from deepguard_db.app.db.models import User, Webhook
from deepguard_db.app.db import crud

from app.dependencies import get_current_user
from app.schemas.webhooks import CreateWebhookRequest, UpdateWebhookRequest, WebhookOut
from app.core.exceptions import not_found

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("", response_model=WebhookOut, status_code=201)
async def create_webhook(
    body: CreateWebhookRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    webhook = Webhook(
        tenant_id=current_user.tenant_id,
        url=body.url,
        events=body.events,
        secret=body.secret,
    )
    db.add(webhook)
    await db.commit()
    await db.refresh(webhook)
    return WebhookOut.model_validate(webhook)


@router.get("", response_model=List[WebhookOut])
async def list_webhooks(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Webhook).where(Webhook.tenant_id == current_user.tenant_id)
    )
    return [WebhookOut.model_validate(w) for w in result.scalars().all()]


@router.put("/{webhook_id}", response_model=WebhookOut)
async def update_webhook(
    webhook_id: uuid.UUID,
    body: UpdateWebhookRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Webhook).where(
            Webhook.id == webhook_id,
            Webhook.tenant_id == current_user.tenant_id,
        )
    )
    webhook = result.scalar_one_or_none()
    if not webhook:
        raise not_found("Webhook")

    if body.url is not None:
        webhook.url = body.url
    if body.events is not None:
        webhook.events = body.events
    if body.status is not None:
        webhook.status = body.status

    await db.commit()
    await db.refresh(webhook)
    return WebhookOut.model_validate(webhook)


@router.delete("/{webhook_id}", status_code=204)
async def delete_webhook(
    webhook_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Webhook).where(
            Webhook.id == webhook_id,
            Webhook.tenant_id == current_user.tenant_id,
        )
    )
    webhook = result.scalar_one_or_none()
    if not webhook:
        raise not_found("Webhook")

    await db.delete(webhook)
    await db.commit()
