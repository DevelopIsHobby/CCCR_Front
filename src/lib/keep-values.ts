/*
  폼을 보낼 때 적어 넣은 값이 지워지지 않게 한다.

  React 19 는 <form action={…}> 으로 보내면 보낸 뒤 칸을 모두 비운다. 새 글을
  잇달아 쓸 때는 편하지만, 서버가 퇴짜를 놓았을 때도 비워 버린다. 홍보 신청처럼
  칸이 열 개인 폼에서 오타 하나에 처음부터 다시 적게 되면 대개 그냥 떠난다.

  그래서 폼이 스스로 보내게 두지 않고, 우리가 FormData 를 만들어 넘긴다.
  React 가 제출을 맡지 않으므로 칸을 비우지도 않는다.

  쓰는 쪽:
    <form onSubmit={keepValues(action)} …>
*/
export function keepValues(action: (formData: FormData) => void) {
  return (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    action(new FormData(event.currentTarget));
  };
}
