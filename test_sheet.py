import gspread
from google.oauth2.service_account import Credentials

SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/11a6l2Kqi5WkgU5rN88cXOKJmp0ZyWsyNY92sZPdfO5Y/edit?gid=0#gid=0"

scope = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

creds = Credentials.from_service_account_file(
    "credentials.json",
    scopes=scope,
)

client = gspread.authorize(creds)
sheet = client.open_by_url(SPREADSHEET_URL).sheet1

sheet.append_row(["テスト", "成功"])
print("書き込み完了")
