import json
import os
import uuid
import base64
import urllib.request
import urllib.error
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Create payment via YooKassa SBP
    Args: event with httpMethod, body (amount)
    Returns: Payment confirmation URL
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        amount = body_data.get('amount', 100)
        
        shop_id = os.environ.get('YOOKASSA_SHOP_ID', 'test_shop')
        secret_key = os.environ.get('YOOKASSA_SECRET_KEY', 'test_key')
        
        idempotence_key = str(uuid.uuid4())
        
        payment_data = {
            'amount': {
                'value': f'{amount:.2f}',
                'currency': 'RUB'
            },
            'confirmation': {
                'type': 'redirect',
                'return_url': body_data.get('return_url', 'https://bet-lsp.com')
            },
            'capture': True,
            'description': f'Пополнение баланса БЕТ-ЛСП на {amount} ₽',
            'payment_method_data': {
                'type': 'sbp'
            }
        }
        
        if shop_id == 'test_shop' or secret_key == 'test_key':
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'status': 'test_mode',
                    'confirmation_url': f'#test-payment-{amount}',
                    'payment_id': idempotence_key,
                    'message': 'Тестовый режим. Добавьте ключи ЮKassa для реальных платежей'
                })
            }
        
        try:
            auth_string = f'{shop_id}:{secret_key}'
            auth_bytes = auth_string.encode('utf-8')
            auth_b64 = base64.b64encode(auth_bytes).decode('utf-8')
            
            headers_req = {
                'Content-Type': 'application/json',
                'Idempotence-Key': idempotence_key,
                'Authorization': f'Basic {auth_b64}'
            }
            
            req = urllib.request.Request(
                'https://api.yookassa.ru/v3/payments',
                data=json.dumps(payment_data).encode('utf-8'),
                headers=headers_req,
                method='POST'
            )
            
            response = urllib.request.urlopen(req)
            response_data = json.loads(response.read().decode('utf-8'))
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'status': 'success',
                    'confirmation_url': response_data['confirmation']['confirmation_url'],
                    'payment_id': response_data['id']
                })
            }
        except urllib.error.HTTPError as e:
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'status': 'error',
                    'message': f'Ошибка YooKassa API. Проверьте ключи в настройках.',
                    'error_code': e.code
                })
            }
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }