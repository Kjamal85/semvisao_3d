// EP2 — tabela única das falas (episodios/MONTAGEM_EP2.md). As cenas leem daqui a janela da boca de cada
// personagem; montar_ep2.py lê o mesmo JSON (entre as chaves) e põe o <audio> no tempo global.
//   cena: a composition · t: início no tempo LOCAL da cena · dur: duração (real do .wav, ou estimada ✳) ·
//   arq: arquivo em voz/audio (ep1/ = fala do EP1 reaproveitada, ep2/ = nova) · quem: quem fala (personagem em quadro mexe a boca) · fx: tratamento na pós
window.EP2_FALAS = {
  "narrador-n01"     : {"cena": "abertura", "t": 0.8, "dur": 4.99, "arq": "ep1/narrador-n01.wav", "quem": "narrador"},
  "narrador-n02"     : {"cena": "abertura", "t": 7.7, "dur": 7.24, "arq": "ep1/narrador-n02.wav", "quem": "narrador"},
  "ep2-narrador-n01" : {"cena": "duda-acorda", "t": 12.5, "dur": 5.48, "arq": "ep2/ep2-narrador-n01.wav", "quem": "narrador"},
  "ep2-duda-01"      : {"cena": "duda-quarto", "t": 4.2, "dur": 3.24, "arq": "ep2/ep2-duda-01.wav", "quem": "duda"},
  "ep2-narrador-n02" : {"cena": "duda-quarto", "t": 13, "dur": 4.18, "arq": "ep2/ep2-narrador-n02.wav", "quem": "narrador"},
  "ep2-maeduda-01"   : {"cena": "duda-cafe", "t": 0.4, "dur": 2.11, "arq": "ep2/ep2-maeduda-01.wav", "quem": "maeduda", "fora": true, "fx": "longe"},
  "ep2-maeduda-02"   : {"cena": "duda-cafe", "t": 7.3, "dur": 4.19, "arq": "ep2/ep2-maeduda-02.wav", "quem": "maeduda"},
  "ep2-duda-02"      : {"cena": "duda-cafe", "t": 15.3, "dur": 1.47, "arq": "ep2/ep2-duda-02.wav", "quem": "duda"},
  "ep2-maeduda-03"   : {"cena": "duda-cafe", "t": 18.3, "dur": 2.36, "arq": "ep2/ep2-maeduda-03.wav", "quem": "maeduda"},
  "c04-reporter-01"  : {"cena": "duda-tv", "t": 0.4, "dur": 6.73, "arq": "ep1/c04-reporter-01.wav", "quem": "reporter", "fx": "tv"},
  "c04-reporter-02"  : {"cena": "duda-tv", "t": 7.8, "dur": 5.9, "arq": "ep1/c04-reporter-02.wav", "quem": "reporter", "fx": "tv"},
  "ep2-reporter-03"  : {"cena": "duda-tv", "t": 14.3, "dur": 5.35, "arq": "ep2/ep2-reporter-03.wav", "quem": "reporter", "fx": "tv"},
  "ep2-maeduda-04"   : {"cena": "duda-despedida", "t": 7.8, "dur": 6.27, "arq": "ep2/ep2-maeduda-04.wav", "quem": "maeduda"},
  "ep2-duda-03"      : {"cena": "duda-despedida", "t": 15.3, "dur": 2.24, "arq": "ep2/ep2-duda-03.wav", "quem": "duda"},
  "c05-radio-01"     : {"cena": "duda-vizinho", "t": 8.5, "dur": 3.79, "arq": "ep1/c05-radio-01.wav", "quem": "radio", "fx": "radio-longe"},
  "ep2-duda-04"      : {"cena": "duda-vizinho", "t": 22.3, "dur": 5.56, "arq": "ep2/ep2-duda-04.wav", "quem": "duda"},
  "ep2-duda-05"      : {"cena": "duda-vizinho", "t": 28.4, "dur": 3.58, "arq": "ep2/ep2-duda-05.wav", "quem": "duda"},
  "ep2-duda-06"      : {"cena": "duda-tarefa", "t": 7.5, "dur": 1.0, "arq": "ep2/ep2-duda-06.wav", "quem": "duda"},
  "ep2-narrador-n03" : {"cena": "duda-caminho", "t": 9, "dur": 3.83, "arq": "ep2/ep2-narrador-n03.wav", "quem": "narrador"},
  "c09-duda-01"      : {"cena": "duda-portao", "t": 6.4, "dur": 4.11, "arq": "ep1/c09-duda-01.wav", "quem": "duda"},
  "c09-mae-03"       : {"cena": "duda-portao", "t": 13.8, "dur": 5.32, "arq": "ep1/c09-mae-03.wav", "quem": "mae", "fx": "distancia"},
  "ep2-duda-07"      : {"cena": "duda-volta", "t": 8, "dur": 1.95, "arq": "ep2/ep2-duda-07.wav", "quem": "duda"},
  "narrador-n13"     : {"cena": "duda-sirene", "t": 0.3, "dur": 6.53, "arq": "ep1/narrador-n13.wav", "quem": "narrador"},
  "c10-agente-01"    : {"cena": "duda-sirene", "t": 18.3, "dur": 3.4, "arq": "ep1/c10-agente-01.wav", "quem": "agente", "fx": "longe"},
  "c10-pai-01"       : {"cena": "duda-sirene", "t": 21.9, "dur": 1.96, "arq": "ep1/c10-pai-01.wav", "quem": "pai", "fx": "longe"},
  "c10-mae-04"       : {"cena": "duda-levam", "t": 1, "dur": 2.71, "arq": "ep1/c10-mae-04.wav", "quem": "mae", "fx": "longe"},
  "c10-gabi-05"      : {"cena": "duda-levam", "t": 4.2, "dur": 2.57, "arq": "ep1/c10-gabi-05.wav", "quem": "gabi", "fx": "longe"},
  "c10-mae-05a"      : {"cena": "duda-levam", "t": 17.5, "dur": 2.55, "arq": "ep1/c10-mae-05.wav", "quem": "mae", "fx": "longe"},
  "c10-mae-05b"      : {"cena": "duda-levam", "t": 20.6, "dur": 2.55, "arq": "ep1/c10-mae-05.wav", "quem": "mae", "fx": "mais-longe"},
  "c10-mae-05c"      : {"cena": "duda-fim", "t": 0.2, "dur": 2.55, "arq": "ep1/c10-mae-05.wav", "quem": "mae", "fx": "fade"}
};
