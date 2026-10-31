<div id="title"></div>

![Matrix Rain Generator](webpExamples/greenMatrixRainREADME.webp)

<h1 align="center">Uma nova forma de estilizar READMEs</h1>

<h3 align="center">Gere um <b>WebP animado transparente e com loop contínuo</b>, com caracteres caindo no estilo Matrix, para estilizar os READMEs do seu GitHub em menos de 1 minuto.

</h3>

<br>

#### O GitHub remove o `<canvas>` (e a maior parte dos estilos CSS) e o JavaScript dos READMEs, então o efeito não pode ser executado diretamente neles. Esta ferramenta renderiza a animação quadro a quadro em um navegador sem interface gráfica e reúne os quadros em um WebP animado, que funciona em qualquer tag HTML `<img>` e no Markdown `![]()`, incluindo o README do seu perfil no GitHub. [Veja um exemplo utilizado no meu perfil](https://github.com/MiguelReisB) e também o exemplo gerado por padrão na primeira execução do código abaixo:

![Matrix Rain Example](webpExamples/defaultBlueMatrixRain.webp)

## Como funciona

1. `script.js` desenha a chuva no elemento `<canvas>` de `rain.html`. Cada quadro é uma função pura de seu índice, então a animação é determinística: uma mesma semente sempre produz o mesmo resultado.

2. `capture.py` abre a página no Chromium em modo headless (*Playwright*), desenha cada quadro e captura uma imagem transparente dele. Os quadros são capturados em paralelo, com um navegador por núcleo da CPU **(se o processo não fosse construído dessa forma, dependendo do tamanho e dos parâmetros da animação, levaria algo em torno de DEZ (10) MINUTOS para gerar um arquivo WebP de aproximadamente 10 segundos).**

3. **Pillow** reúne os quadros em um WebP animado com canal alfa completo.

O loop é contínuo porque nenhuma coluna começa a cair se não puder terminar antes do fim da chuva. Os últimos quadros ficam vazios, funcionando como o “corte” entre o final e o início da animação.

## Requisitos do sistema

- Python 3.9+
- Git (é claro)
- Aproximadamente 1 GB de RAM livre para as configurações padrão (os quadros são mantidos na memória)

As demais dependências são instaladas pelo arquivo `requirements.txt`.

## Primeiros passos

### 1. Clone este repositório e continue com as próximas etapas no mesmo terminal

```bash
git clone https://github.com/MiguelReisB/matrix-rain-gen.git
cd matrix-rain-gen
```

### 2. Crie e ative um ambiente virtual

Linux / macOS:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Windows (PowerShell):

```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
```

Windows (CMD):

```bat
py -m venv .venv
.venv\Scripts\activate.bat
```

> Após esta etapa, você deverá ver `(.venv)` no início da linha de comando do terminal.

### 3. Instale as dependências

```bash
pip install -r requirements.txt
playwright install chromium
```

`playwright install chromium` baixa o navegador utilizado na renderização. Ele é armazenado fora do ambiente virtual, portanto só precisa ser instalado uma vez por máquina.

Em um servidor Linux sem interface gráfica, use `playwright install --with-deps chromium` no lugar.

### 4. Personalize e altere as configurações do código e os parâmetros do WebP como preferir

#### *Consulte a [seção de personalização](#customize)

#### 4.1 Em seguida, gere o WebP

```bash
python capture.py
```

- Se não funcionar:

```bash
python3 capture.py
```

O resultado será salvo como `matrixRain.webp` na pasta do projeto.

### 5. Quando terminar e estiver satisfeito com o resultado final:

```bash
# Finalize / encerre a execução do .venv com:
deactivate
```

### 6. Use-o em um README (coloque o arquivo dentro da pasta do projeto, como um recurso separado)

Como HTML:

```html
<img src="path/to/your/matrixRain.webp" alt="Matrix Rain Animation" width="100%">
```

Como Markdown:

```md
![Matrix Rain Animation](path/to/your/matrixRain.webp)
```

> O tamanho padrão é de 900 x 600 (Largura x Altura), pois o GitHub limita a largura máxima das imagens nos READMEs a 900 px. A altura pode ser alterada como preferir.

<h2 id="customize">Personalize como quiser</h2>

Edite as constantes de `script.js` e `capture.py` e, em seguida, execute `python capture.py` (ou `python3 capture.py`).

### Em `script.js`

| Configuração | Padrão | O que altera |
|---|---|---|
| `WIDTH`, `HEIGHT` | `900`, `600` | Dimensões da captura de tela. Devem corresponder às dimensões em `rain.html` e `capture.py`. |
| `FONT_SIZE` | `33` | Tamanho dos caracteres em pixels. Valores maiores resultam em menos colunas, com caracteres maiores. |
| `PATH_SIZE` | `14` | Comprimento do rastro em caracteres. Rastros mais longos desaparecem mais lentamente. |
| `COLOR` | `'30, 144, 255'` | Cor RGB dos caracteres (`R, G, B`). `'0, 255, 70'` produz o verde clássico. |
| `CHARACTERS` | katakana + números + letras + símbolos | Conjunto de caracteres escolhidos aleatoriamente para a animação. Substitua por qualquer string. Também aceita emojis. |
| `FPS` | `25` | Quadros por segundo. Um valor maior deixa a animação mais suave, mas gera mais quadros, tornando a geração mais lenta e o arquivo maior. |
| `SECONDS_RAIN` | `10` | Duração da chuva. Corresponde à maior parte da duração da animação. |
| `SECONDS_EMPTY` | `0.1` | Intervalo vazio no final, utilizado como corte do loop. Aumente-o para criar uma pausa maior antes do reinício. |
| `20 / FPS` (`velForFrame`) | `20` linhas/s | Velocidade de queda. O valor `20` representa linhas por segundo: quanto maior, mais rápido. |
| Intervalos em `cron` (`FPS * 1.7`) | `1.7 s` | Pausa aleatória máxima entre duas quedas na mesma coluna. Um valor menor deixa a chuva mais densa. |
| Primeiro início (`FPS * 4`) | `4 s` | Atraso máximo antes da primeira queda de uma coluna. Um valor menor faz a tela ser preenchida mais rapidamente. |

Total de quadros = `FPS × (SECONDS_RAIN + SECONDS_EMPTY)`, e a duração total do arquivo é `SECONDS_RAIN + SECONDS_EMPTY`.

> **Dica:** enquanto ajusta as cores e os tamanhos, use `SECONDS_RAIN = 2`, um `FPS` mais baixo e `method = 0` para gerar uma prévia mais rapidamente. Quando estiver satisfeito com o resultado, restaure os valores finais.

### Em `capture.py`

| Configuração | Padrão | O que altera |
|---|---|---|
| `WIDTH`, `HEIGHT` | `900`, `600` | Dimensões da captura de tela. Devem corresponder às dimensões em `rain.html` e `script.js`. |
| `SEED` | `1` | Sementes diferentes produzem padrões de chuva diferentes. A mesma semente sempre reproduz o mesmo arquivo. |
| `WORKERS` | Quantidade de CPUs | Número de navegadores executados em paralelo. Reduza esse valor se a memória RAM acabar. |
| `quality` | `90` | Qualidade do WebP (0–100). Valores menores geram arquivos menores, mas com mais artefatos de compressão. |
| `alpha_quality` | `100` | Qualidade do canal de transparência. Mantenha em 100 para preservar as bordas suaves dos caracteres. |
| `method` | `4` | Nível de esforço do codificador (0–6). `6` gera o menor arquivo, mas é muito mais lento. `0` é o mais rápido e é útil durante os testes. |
| `exact` | `False` | Quando `True`, mantém dados de cor sob pixels totalmente transparentes. Isso não é necessário neste projeto. |

### Em `rain.html`

| Configuração | Padrão | O que altera |
|---|---|---|
| `width`, `height` | `900`, `600` | Dimensões da captura de tela. Devem corresponder às dimensões em `capture.py` e `script.js`. |

### Em `style.css`

| Configuração | Padrão | O que altera |
|---|---|---|
| `CSS mask-image` | `black 20%` | Define onde começa o efeito de desaparecimento na parte inferior. `black 60%` faz o efeito começar mais abaixo; remover a máscara cria uma borda abrupta. |

## Exemplos e respectivas configurações alteradas

*Você encontra cada exemplo na pasta `webpExamples`.*

### Verde clássico do Matrix

![Classic green](webpExamples/greenMatrixRain.webp)

| Configuração alterada | Valor |
|---|---|
| `COLOR` | `34, 250, 10 / (#22FA0A)` |
| `SEED` | `10` |
| `FPS` | `30` |
| `velForFrame` | `35 / FPS` |
| Intervalos em `cron` | `FPS * 0.3` |

### Banner vermelho largo e lento

![Wide banner](webpExamples/redMatrixRain.webp)

| Configurações alteradas | Valor |
|---|---|
| `COLOR` | `255, 0, 0 / (#FF00000)` |
| `SEED` | `67` |
| `WIDTH` × `HEIGHT` | 1200 × 300 |
| `FONT_SIZE` | 24 |

> Lembre-se de atualizar o tamanho do canvas nos três locais: constantes de `script.js`, tag `<canvas>` e `capture.py`.

### Roxo rápido e denso

![Fast and Dense](webpExamples/purpleMatrixRain.webp)

| Configurações alteradas | Valor |
|---|---|
| `COLOR` | `92, 0, 167 / (#5C00A7)` |
| `SEED` | `83` |
| `velForFrame` | `4 / FPS` |
| `FONT_SIZE` | 24 |

### Âmbar alto

![Tall Amber](webpExamples/amberMatrixRain.webp)

| Configurações alteradas | Valor |
|---|---|
| `HEIGHT` | `2000` |
| `COLOR` | `245, 158, 11 / (#F59E0B)` |

> Este exemplo levou mais de 1 minuto (1 min e 5 s) para ser gerado devido às suas dimensões.

(Altere `PATH_SIZE` para obter uma coluna de caracteres mais longa), mas lembre-se de que isso também aumentará ainda mais o tamanho do arquivo.

## Cores que você deveria experimentar

### Dê um visual único à sua própria Matrix Rain usando a cor principal dos seus projetos

> Mas tenha cuidado!

Dependendo da cor dos caracteres e do tema utilizado pelo usuário (escuro ou claro), a animação pode não ficar muito visível. Isso acontece porque o fundo é transparente e as colunas desaparecem gradualmente.

Aqui estão algumas cores que funcionam bem nos dois temas:

| COR | HEX | RGB | VALOR PARA COLOCAR EM `COLOR` |
|---|---|---|---|
| Azul (padrão do código) | `#1E90FF` | 30, 144, 255 | `'30, 144, 255'` |
| Ciano | `#06B6D4` | 6, 182, 212 | `'6, 182, 212'` |
| Verde azulado (teal) | `#14B8A6` | 20, 184, 166 | `'20, 184, 166'` |
| Esmeralda | `#10B981` | 16, 185, 129 | `'16, 185, 129'` |
| Verde | `#22C55E` | 34, 197, 94 | `'34, 197, 94'` |
| Violeta | `#8B5CF6` | 139, 92, 246 | `'139, 92, 246'` |
| Rosa | `#EC4899` | 236, 72, 153 | `'236, 72, 153'` |
| Vermelho | `#EF4444` | 239, 68, 68 | `'239, 68, 68'` |
| Laranja | `#F97316` | 249, 115, 22 | `'249, 115, 22'` |
| Âmbar | `#F59E0B` | 245, 158, 11 | `'245, 158, 11'` |

## Problemas que você pode encontrar e como resolvê-los

- **Erro `Executable doesn't exist` do Playwright:** execute `playwright install chromium` dentro do ambiente virtual ativado.
- **Falta de memória:** reduza `WORKERS`, `FPS` ou as dimensões do canvas.
- **Erro de `range()` relacionado a um valor decimal:** certifique-se de que `FRAMES_TOTAL` esteja envolvido em `Math.round(...)` em `rain.html`.
- **Geração lenta:** reduza o valor de `method` em `capture.py`. O tempo de captura e o tempo de codificação são exibidos ao final, permitindo identificar qual etapa está demorando mais.
- **A animação não faz um loop contínuo:** mantenha `SECONDS_EMPTY` acima de zero.

## Indo além

Para colocar um texto sobre os caracteres em queda e estilizar esse texto com uma fonte interessante (como a que aparece no [topo deste README](#title)), usei:

- A ferramenta online [Photopea](https://www.photopea.com/) (a ferramenta é de código aberto e foi a que encontrei que permitia editar o WebP da maneira que eu queria);
- Importe o WebP animado para ela;
- Selecione o Editor de Texto, escreva o texto desejado e escolha uma fonte, um tamanho e uma cor que combinem;
- Exporte como WebP...

### E voilà!

![Miguel Dev Matrix Rain](webpExamples/titleMatrixRain.webp)

> Observe que isso aumenta bastante o tamanho do arquivo.

## Uma ajudinha é sempre bem-vinda

#### Encontrou algo que poderia ser melhorado ou algum bug/erro?

Algumas formas de contribuir:

- Abrindo uma *Issue*;
- Fazendo um *Fork* do repositório e abrindo um *Pull Request*;
- Ou entrando em contato diretamente comigo.

Posso garantir que responderei e analisarei a solicitação e o código o mais rápido possível!

## Licença

*Apache 2.0* | [Ver licença](LICENSE)

---

#### Se você gostou ou achou o projeto útil de alguma forma, não se esqueça de deixar uma ⭐ para que mais pessoas possam encontrá-lo e utilizá-lo!
