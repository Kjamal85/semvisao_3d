# Análise quadro a quadro — "E se você acordasse todo dia com um poder DIFERENTE?"

Vídeo: `F:\estudo video\E se você acordasse todo dia com um poder DIFERENTE_.mp4` — 14:34.56, 1920×1080, 60 fps, 52.473 quadros.

## Feito
1. Transcrição palavra por palavra → `transcricao.md`, `transcricao_palavras.tsv`, `transcricao.json`.
2. Medição de cada quadro → `dados/quadros.csv` (`ferramentas/medir_quadros.py`).
3. Cortes confirmados por bordas → `dados/cortes.csv` (`bordas_cortes.py` + `planos_camera.py`).
   - Os candidatos com `ncc_bordas ≥ 0,5` são `mudanca_no_plano`: Gui piscando de fantasma, brilho, clarão. Não são cortes.
4. Câmera por quadro e por trecho → `dados/camera_quadro.csv`, `dados/camera_trechos.csv`, `dados/planos.json`.
   - Conferido em imagem: a aproximação lenta (cerca de 2–4% de escala por segundo) é real. Não é erro de medição.
5. Folhas a 6 quadros/s → `folhas_6fps/` (10 s por folha, 88 folhas). TODAS LIDAS → `leitura.md`.
6. Folhas com todos os quadros → `folhas_todos/` (18 momentos; m01–m04, m06, m11 e m17 conferidos).
7. Relatório → `relatorio.md` (câmera, entradas, textos, som, estrutura).

## Falta (opcional)
- Conferir de ouvido as palavras ⚠ da transcrição.
- Ler com calma as folhas m05, m07–m10, m12–m16 e m18.

## Como refazer
```
cd analise_referencia
py -3.14 -I ferramentas/medir_quadros.py <video> poder_diferente/dados/quadros.csv
py -3.14 -I ferramentas/planos_camera.py poder_diferente/dados/quadros.csv poder_diferente/dados
py -3.14 -I ferramentas/bordas_cortes.py <video> poder_diferente/dados/cortes.csv poder_diferente/dados/bordas_cortes.csv
py -3.14 -I ferramentas/planos_camera.py poder_diferente/dados/quadros.csv poder_diferente/dados   # 2ª vez, já com as bordas
py -3.14 -I ferramentas/folhas.py 6fps <video> poder_diferente/dados poder_diferente/folhas_6fps 10
py -3.14 -I ferramentas/folhas.py todos <video> poder_diferente/dados poder_diferente/folhas_todos <ini_s> <fim_s> <nome>
```
