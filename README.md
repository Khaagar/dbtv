# DBTV

Responsywny szablon aplikacji „streaming-like” dla fanów Dragon Balla. Obecna
wersja zawiera interaktywny katalog czterech serii, wyszukiwarkę, przełączanie
widoku, okno podglądu z placeholderem wideo i glassmorphism inspirowany kolorami
uniwersum.

Po otwarciu strony klient pobiera polskie tytuły 153 odcinków oryginalnego
`Dragon Ball` z publicznego API Wikipedii i pokazuje status importu nad katalogiem.
Źródłem jest [Lista odcinków serialu anime Dragon Ball](https://pl.wikipedia.org/wiki/Lista_odcink%C3%B3w_serialu_anime_Dragon_Ball),
a pozycje są oznaczone jako dane CC BY-SA. Gdy API jest niedostępne, interfejs
pozostaje użyteczny i wyświetla bezpieczny fallback `Odcinek 1…153`.

## Podgląd na telefonie

### Bez komputera — GitHub Pages

Projekt publikuje katalog `src/` automatycznie przez GitHub Pages. Całą operację
można wykonać w aplikacji GitHub lub w przeglądarce na telefonie:

1. Otwórz repozytorium i zaakceptuj/połącz zmiany z pull requesta.
2. Utwórz token dostępu GitHub z uprawnieniami zapisu do administracji
   repozytorium i GitHub Pages. W klasycznym tokenie wymagany jest zakres `repo`;
   w fine-grained tokenie wybierz to repozytorium oraz uprawnienia
   **Administration: Read and write** i **Pages: Read and write**.
3. W repozytorium przejdź do **Settings → Secrets and variables → Actions**, użyj
   **New repository secret**, nazwij sekret dokładnie `PAGES_TOKEN` i wklej token.
   Workflow używa go wyłącznie do jednorazowego włączenia lub konfiguracji Pages.
4. Otwórz kartę **Actions**, wybierz workflow **Publikacja podglądu DBTV** i
   naciśnij **Run workflow**. Po połączeniu zmian workflow uruchamia się też
   automatycznie.
5. Po zakończeniu zielonym znacznikiem otwórz wykonanie workflow i dotknij adresu
   widocznego w sekcji **deployments**. Typowy adres ma postać
   `https://NAZWA-UZYTKOWNIKA.github.io/NAZWA-REPOZYTORIUM/`.

Pierwsza publikacja wymaga uprawnień administratora repozytorium. Sam link
działa potem na telefonie bez uruchamiania terminala i bez pozostawiania żadnego
komputera włączonego. Workflow publikuje wyłącznie statyczny szablon z `src/` —
nie publikuje tokenów ani danych logowania.

Jeśli w aplikacji GitHub nie widać ustawień Pages, otwórz GitHub w przeglądarce,
włącz opcję **Witryna na komputer** i wykonaj powyższe kroki. Alternatywnie osoba
z uprawnieniami administratora może włączyć Pages jeden raz, a Tobie wysłać już
gotowy link.

#### Naprawa błędu `Get Pages site failed` / `Not Found`

Ten komunikat oznacza, że GitHub Pages nie było jeszcze włączone dla
repozytorium. Aktualny workflow używa `enablement: true`, więc potrafi włączyć je
automatycznie, ale akcja GitHub nie zezwala na tę operację przy użyciu zwykłego
`GITHUB_TOKEN`. Sprawdź, czy:

1. sekret nazywa się dokładnie `PAGES_TOKEN` (wielkimi literami);
2. token nie wygasł i ma dostęp do tego repozytorium;
3. token ma uprawnienia zapisu do **Administration** i **Pages**;
4. po dodaniu sekretu workflow został uruchomiony ponownie przez **Re-run all
   jobs** albo **Run workflow**.

Po pierwszym poprawnym uruchomieniu strona Pages jest już skonfigurowana, ale
sekret nadal jest potrzebny przy kolejnych wykonaniach obecnego workflow. Nie
wklejaj wartości tokenu do pliku, komentarza, issue ani logów — wyłącznie do
ustawień sekretów repozytorium.

### Z komputerem — lokalna sieć Wi-Fi

### 1. Uruchom stronę na komputerze

W terminalu, w katalogu projektu, wykonaj:

```bash
npm install
npm run dev
```

Terminal wypisze osobno adres dla komputera i jeden lub więcej adresów dla
telefonu, na przykład:

```text
DBTV preview (komputer): http://localhost:4173
DBTV preview (telefon):
  http://192.168.1.25:4173
```

### 2. Otwórz adres na telefonie

1. Połącz telefon i komputer z **tą samą siecią Wi-Fi**.
2. Nie zamykaj terminala z uruchomionym `npm run dev`.
3. W Chrome lub Safari na telefonie wpisz dokładnie adres pokazany pod
   `DBTV preview (telefon)`. Nie używaj na telefonie adresu `localhost` ani
   `0.0.0.0` — wskazywałyby na sam telefon, a nie komputer.
4. Zatrzymaj serwer skrótem `Ctrl+C`, kiedy skończysz.

### Gdy telefon nie może otworzyć strony

- sprawdź, czy zadziałał adres `http://localhost:4173` na komputerze;
- wyłącz na chwilę VPN na telefonie i komputerze;
- upewnij się, że Wi-Fi nie ma włączonej izolacji klientów/gości;
- zezwól Node.js na połączenia przychodzące na prywatnej sieci w zaporze systemu;
- sprawdź inny wypisany adres, jeśli terminal pokazał ich kilka;
- nie dodawaj `https://` — lokalny serwer używa `http://`.

Serwer nasłuchuje na wszystkich interfejsach, więc podgląd mobilny nie wymaga
Android Studio ani emulatora. Adres LAN działa tylko w lokalnej sieci; nie należy
wystawiać tego prostego serwera bezpośrednio do Internetu.

Wersję produkcyjną generuje `npm run build`; gotowe statyczne pliki trafiają do
`dist/` i można je umieścić na dowolnym hostingu statycznym.

> **Ważne:** DBTV nie obchodzi DRM, paywalla ani zabezpieczeń serwisu. Integrację
> z dostawcą należy wykonać przez jego oficjalne API/SDK i zgodnie z regulaminem.
> Sam fakt posiadania abonamentu nie musi oznaczać zgody na automatyczne
> pobieranie katalogu lub odtwarzanie materiałów w aplikacji zewnętrznej.

## Od czego zacząć

Najpierw ustalamy, co udostępnia serwis źródłowy:

1. **OAuth 2.0 / Device Authorization Grant** – najlepszy wariant dla TV. Aplikacja
   pokazuje kod, użytkownik loguje się na telefonie, a TV otrzymuje krótkotrwały
   token dostępu.
2. **Oficjalne API lub SDK z logowaniem** – również dobry wariant; stosujemy
   dokładnie mechanizm przewidziany przez dostawcę.
3. **Tylko strona WWW, bez API** – bez pisemnej zgody nie kopiujemy ciasteczek,
   tokenów ani linków do strumieni. Bezpieczny MVP może być katalogiem z
   deep-linkami otwierającymi oficjalną aplikację lub stronę.

Wklejanie tokenu z narzędzi deweloperskich nie jest dobrym rozwiązaniem: token
może dawać pełny dostęp do konta, szybko wygasać, naruszać regulamin i wyciec z
logów albo schowka. Nie należy też umieszczać loginu i hasła użytkownika na
naszym serwerze.

Szczegółowy proponowany przepływ, granice bezpieczeństwa i plan MVP znajdują się
w [`docs/architecture.md`](docs/architecture.md).

## Proponowany zakres MVP

- interfejs Android TV obsługiwany pilotem: serie, sezony, odcinki, wyszukiwanie;
- logowanie kodem urządzenia, **jeżeli dostawca oficjalnie je wspiera**;
- synchronizacja katalogu przez adapter oficjalnego API;
- odtwarzanie HLS/DASH przez AndroidX Media3 tylko dla autoryzowanych źródeł;
- „kontynuuj oglądanie”, ulubione i historia przechowywane niezależnie od danych
  uwierzytelniających;
- fallback do oficjalnej aplikacji przez deep link, gdy odtwarzanie zewnętrzne
  nie jest dozwolone.

## Czego potrzebujemy przed implementacją

- nazwy i adresu serwisu, kraju konta oraz linku do jego regulaminu;
- informacji, czy istnieje oficjalne API, aplikacja TV lub program partnerski;
- listy oczekiwanych funkcji i urządzeń/testowanej wersji Android TV;
- potwierdzenia, że dostawca zezwala na katalogowanie i odtwarzanie w kliencie
  zewnętrznym.

Po uzyskaniu tych danych można wybrać właściwy wariant integracji, zamiast
budować kruchy crawler zależny od HTML-a strony.
