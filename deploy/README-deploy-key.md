# 사무실 PC 배포 키

`claude-deploy.pub` 은 사무실 PC(Claude Code)가 서버에 접속할 때 쓰는 **공개키**입니다.
공개키는 공개되어도 안전합니다. 이 키로 들어오려면 사무실 PC 에만 있는 비밀키가 필요합니다.

## 서버에 등록하는 법

```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
curl -fsSL https://raw.githubusercontent.com/DevelopIsHobby/CCCR_Front/main/deploy/claude-deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

## 그만 쓰고 싶을 때

서버에서 `~/.ssh/authorized_keys` 를 열어 `c3r-deploy@claude-code` 로 끝나는 줄을 지우면 됩니다.
