# Architektura bezpiecznej integracji DBTV

## 1. Założenia i granice

DBTV ma być wygodnym klientem telewizyjnym, a nie narzędziem do omijania zasad
dostawcy. Projekt nie powinien:

- omijać DRM, podpisów URL, geoblokad, limitów urządzeń ani paywalla;
- przechwytywać lub prosić użytkownika o ręczne wklejanie ciasteczek sesyjnych;
- zapisywać hasła do zewnętrznego serwisu;
- udawać przeglądarki albo oficjalnej aplikacji wbrew warunkom usługi;
- publikować pozyskanych URL-i, tokenów lub metadanych bez odpowiedniej licencji.

Jeśli dostawca nie oferuje integracji, prawidłowym zakończeniem odtwarzania jest
deep link do jego oficjalnego klienta. HTML scraping może być użyty wyłącznie po
potwierdzeniu, że regulamin i właściciel serwisu na to pozwalają; nie powinien
wydobywać chronionych adresów mediów.

## 2. Preferowany przepływ logowania na TV

Najlepiej użyć standardowego przepływu kodu urządzenia oferowanego przez
dostawcę:

```text
Android TV                 Dostawca tożsamości              Telefon
    | POST device/code              |                          |
    |------------------------------>|                          |
    | user_code + verification_uri  |                          |
    |<------------------------------|                          |
    | pokaż kod                     |<--- logowanie + kod ------|
    | okresowo POST token           |                          |
    |------------------------------>|                          |
    | access_token + refresh_token  |                          |
    |<------------------------------|                          |
```

Zasady implementacyjne:

- TV przechowuje token odświeżania w Android Keystore/zaszyfrowanym magazynie;
- token dostępu pozostaje w pamięci i ma możliwie krótki czas życia;
- backend nigdy nie loguje nagłówka `Authorization`, ciasteczek ani pełnych URL-i
  zawierających podpis;
- wylogowanie unieważnia token u dostawcy i czyści dane lokalne;
- kody urządzenia mają krótki termin ważności, limit prób i czytelny stan błędu;
- telemetria używa losowego identyfikatora instalacji, nie identyfikatora konta.

Jeżeli dostawca obsługuje tylko OAuth w przeglądarce, należy zastosować systemową
kartę przeglądarki i PKCE. Wbudowany WebView nie powinien zbierać hasła ani
eksportować ciasteczek.

## 3. Komponenty

```text
┌──────────────────────── Android TV ────────────────────────┐
│ UI TV → ViewModel → CatalogRepository → ProviderAdapter    │
│                  ↘ ProgressStore      ↘ PlaybackResolver   │
│                                             ↓              │
│                                      Media3 Player         │
└────────────────────────────────────────────────────────────┘
                    │ HTTPS, oficjalne API
                    ▼
┌──────────────────── Dostawca treści ───────────────────────┐
│ OAuth/API katalogu/API odtwarzania/licencjonowany DRM      │
└────────────────────────────────────────────────────────────┘
```

`ProviderAdapter` izoluje integrację od reszty aplikacji. Minimalny kontrakt:

```kotlin
interface ProviderAdapter {
    suspend fun beginDeviceLogin(): DeviceLogin
    suspend fun pollDeviceLogin(id: String): LoginState
    suspend fun series(): List<Series>
    suspend fun episodes(seriesId: String, seasonId: String): List<Episode>
    suspend fun playback(episodeId: String): PlaybackAuthorization
    suspend fun logout()
}
```

`PlaybackAuthorization` powinien powstawać dopiero po wybraniu odcinka. Może
zawierać czasowy URL manifestu oraz konfigurację DRM zwróconą oficjalnie przez
dostawcę, ale nie trafia do bazy, analityki ani cache katalogu.

Opcjonalny backend jest uzasadniony tylko wtedy, gdy wymaga go oficjalna
integracja (np. poufny sekret klienta). Pełni wtedy rolę brokera API, nie
magazynu haseł, ciasteczek czy stałych linków do wideo.

## 4. Dane i cache

Lokalna baza może zawierać:

- identyfikatory serii, sezonów i odcinków oraz dozwolone metadane;
- pozycję odtwarzania, ulubione i czas ostatniej synchronizacji;
- wersję schematu adaptera i techniczny stan synchronizacji.

Nie zapisujemy w niej tokenów, ciasteczek, podpisanych manifestów ani licencji
DRM. Cache katalogu ma określony TTL, a usunięcie konta czyści zarówno sekrety,
jak i dane użytkownika.

## 5. Etapy realizacji

1. **Discovery** – sprawdzić dokumentację, regulamin i uzyskać zgodę/API.
2. **Prototyp UI** – zbudować ekran główny i odtwarzacz na danych testowych,
   bez integracji z cudzym kontem.
3. **Adapter sandbox** – wdrożyć oficjalne logowanie i katalog w środowisku
   testowym dostawcy; dodać timeouty, retry z backoffem i obsługę limitów API.
4. **Playback** – podłączyć zwracane przez API HLS/DASH i licencję DRM poprzez
   wspierany mechanizm Media3.
5. **Hardening** – threat modeling, redakcja logów, test wylogowania, rotacji
   tokenów, utraty sieci, wygasania sesji oraz nawigacji pilotem.
6. **Fallback** – dla materiałów niedostępnych w API otwierać oficjalny deep
   link, nie próbować rekonstruować adresu strumienia.

## 6. Kryteria decyzji po rozpoznaniu serwisu

| Możliwość dostawcy | Decyzja |
|---|---|
| Device flow + API odtwarzania | Pełny natywny klient TV |
| OAuth + API odtwarzania | Logowanie w systemowej przeglądarce z PKCE |
| API katalogu, brak playback API | Katalog + deep link |
| Brak API, zgoda na wybrane metadane | Ograniczony adapter zgodny z umową |
| Brak API i brak zgody | Bez crawlera; prototyp na danych testowych |

Ta tabela zapobiega uzależnieniu całej aplikacji od ręcznie kopiowanego tokenu
lub selektorów HTML, które są jednocześnie ryzykowne i nietrwałe.
