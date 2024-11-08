import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from app.routers import audio  # audio 라우터 임포트

app = FastAPI()

# Static files 설정
app.mount("/static", StaticFiles(directory=os.path.join(os.getcwd(), "static")), name="static")

# 라우터 등록
app.include_router(audio.router)

# index.html 서빙
@app.get("/", response_class=HTMLResponse)
async def get_index():
    with open(os.path.join(os.getcwd(), "static", "index.html")) as f:
        return HTMLResponse(content=f.read(), status_code=200)
