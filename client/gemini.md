# Movan Dev Lab - Guia de Testes

Este front-end foi modularizado para que você possa testar os endpoints do seu backend de forma independente.

## Módulos de Teste

### 1. Módulo de Endereços (`/api/autocomplete` e `/api/geocode`)
Use o campo superior para testar a busca e a transformação de endereço em coordenadas. 
- Ao selecionar uma sugestão, o front chama o geocode.
- O resultado (Lat/Lng) aparece em um box de debug e um marcador surge no mapa.

### 2. Módulo de Roteirização (`/api/optimize`)
Este módulo segue dois passos obrigatórios:

#### Passo A: Otimizar (Cálculo)
- Envia o JSON com `capacity` e `shipments`.
- O backend processa e **deve retornar** a sequência otimizada e os dados da rota.
- O front exibe o JSON de resposta no box de debug para você conferir a ordem dos alunos.

#### Passo B: Traçar (Visualização)
- O botão "Traçar no Mapa" só habilita se você já tiver o resultado da otimização.
- Ao clicar, ele lê o campo `route` do seu JSON e desenha a linha no mapa.

---

## Formato de Resposta Obrigatório para `/api/optimize`

Para que o botão **Traçar** funcione e os dados apareçam no debug, seu backend deve responder exatamente assim:

```json
{
  "totalDistance": 5400,
  "totalDuration": 1200,
  "optimizedSequence": [
    { "type": "pickup", "student": "João", "estimatedArrival": "07:10" },
    { "type": "delivery", "student": "João", "estimatedArrival": "07:25" }
  ],
  "route": [
    [-23.5505, -46.6333],
    [-23.5510, -46.6340],
    [-23.5600, -46.6400]
  ]
}
```

- **`route`**: Array de coordenadas `[lat, lng]`. Se este campo estiver vazio ou ausente, a linha não será desenhada.
- **`optimizedSequence`**: Use este campo para mostrar ao usuário a ordem que o Google definiu.

---

## Dicas para o seu Backend
1. **Logs**: O front agora exibe o JSON de erro e o JSON de sucesso no console e na tela.
2. **CORS**: Lembre-se que o front roda em uma porta (geralmente 5173) e o backend em outra (3000). O CORS é obrigatório.
3. **Google API**: Use o `optimizedSequence` para validar se o Google está respeitando as janelas de tempo (`maxArrivalTime`) que o front envia.
