# Language

All reasoning, comments, and generated documentation should be written in **Korean (한국어)** unless interacting with external APIs or libraries that require English.

- Code comments: Korean
- Commit messages: Korean
- Explanations and analysis: Korean
- Documentation: Korean

English should only be used when:
- Writing code identifiers
- Referring to library names
- Quoting external documentation

# Project Development Guidelines

이 문서는 v-album 프로젝트의 개발 및 유지보수를 위한 가이드라인입니다.

## 0. 제한 사항
- V-Album-Server는 ASP.NET 기반의 백엔드 서버이고, 별도로 관리되고 있으므로 Junie가 해당 폴더를 관리할 수 없습니다. 이에 따라 Junie는 프론트엔드 개발에만 집중해야 합니다.

## 1. 빌드 및 설정 가이드 (Build & Configuration)

프로젝트는 프론트엔드(Next.js)와 백엔드(ASP.NET Core)로 구성된 모노레포 구조입니다.

### 프론트엔드 (Next.js)
- **런타임**: Node.js
- **주요 기술**: Next.js 15+, React 19, Tailwind CSS 4, NextAuth.js, TanStack Query
- **설정**:
    - `.env.local` 파일을 생성하고 다음 환경 변수를 설정해야 합니다.
        - `NEXTAUTH_SECRET`: NextAuth 암호화 키
        - `NEXTAUTH_URL`: 인증 콜백 URL (예: `http://localhost:3000`)
        - `BACKEND_BASE_URL`: 백엔드 API 주소 (예: `http://localhost:5117`)
        - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: 구글 OAuth 설정
- **빌드 및 실행**:
    ```bash
    npm install    # 의존성 설치
    npm run dev    # 개발 서버 실행 (localhost:3000)
    npm run build  # 프로덕션 빌드
    ```

### 백엔드 (ASP.NET Core)
- **런타임**: .NET 9.0
- **데이터베이스**: MySQL (Entity Framework Core 사용)
- **설정**:
    - `V-Album-Server/appsettings.json`에서 데이터베이스 연결 문자열과 Google Auth 설정을 확인하세요.
    - `ConnectionStrings:Main`: `Server=localhost;Port=3306;Database=test;User=root;Password=1234;` (로컬 환경에 맞게 수정)
- **빌드 및 실행**:
    ```bash
    dotnet build V-Album-Server  # 프로젝트 빌드
    dotnet run --project V-Album-Server # 서버 실행 (기본 포트: 5117)
    ```

## 2. 테스트 가이드 (Testing Information)

### API 테스트 (HTTP Client)
- 백엔드 API를 테스트하기 위해 JetBrains IDE의 HTTP Client를 사용하는 것을 권장합니다.
- `V-Album-Server/V-Album-Server.http` 파일을 확장하거나 별도의 `.http` 파일을 생성하여 테스트할 수 있습니다.

**예제 테스트 케이스 (`test-api.http`):**
```http
### 내 정보 가져오기 (인증 헤더 포함)
GET http://localhost:5117/api/user/me
X-Google-Sub: 116932636384725097207
Accept: application/json
```

### 테스트 추가 및 실행 가이드
1. **백엔드**: 새로운 API를 추가할 때 `V-Album-Server.http`에 해당하는 엔드포인트 호출 예제를 추가하여 즉시 검증할 수 있도록 합니다.
2. **프론트엔드**: `app/api/` 경로의 라우트 핸들러를 수정할 때는 `fetch` 호출 시 `X-Google-Sub` 헤더와 `BACKEND_BASE_URL`이 올바르게 전달되는지 확인하세요.

## 3. 추가 개발 정보 (Development & Debugging)

### 코드 스타일 및 규칙
- **프론트엔드**:
    - **TypeScript**: 엄격한 타입 체크를 지향하며, 가능한 `any` 사용을 지양합니다.
    - **Linting**: `npm run lint`를 통해 코드 스타일을 확인하세요. (ESLint 사용)
    - **Components**: UI 컴포넌트는 `components/ui` (Shadcn UI 기반)를 재사용합니다.
- **백엔드**:
    - **C#**: .NET 9의 최신 기능(Primary Constructors, Records 등)을 적극적으로 활용합니다.
    - **Controller**: API 경로는 `api/[controller]` 또는 명시적 경로(`api/auth/login`)를 사용하며, 비동기 처리를 위해 `Task<IActionResult>`와 `CancellationToken`을 사용합니다.
- **인증 구조**:
    - 프론트엔드(Next.js)에서 NextAuth를 통해 Google 로그인을 수행하고 가져온 `sub` 값을 백엔드에 `X-Google-Sub` 헤더로 전달하여 사용자를 식별합니다.

### 디버깅 팁
- 백엔드 API 응답이 401 Unauthorized인 경우, `X-Google-Sub` 헤더가 누락되었거나 백엔드 DB에 해당 사용자가 존재하는지 확인하세요.
- Next.js의 서버 사이드 로그는 터미널에서, 클라이언트 사이드 로그는 브라우저 콘솔에서 확인 가능합니다.
