// 카드 테이블을 위한 요소를 지정합니다.
cards.init({
	table: '#card-table',
	cardUrl: 'img/cards.png',
	cardSize: {
			width: 69,
			height: 94,
			padding: 100,
	},
	type: "STANDARD", // 카드 유형을 표준으로 설정합니다.
});

// 새로운 카드 덱을 생성합니다.
let deck = new cards.Deck();
deck.addCards(cards.all);
cards.shuffle(deck);
deck.render({ immediate: true });

let upperhand; // 상단 핸드
let lowerhand; // 하단 핸드
let iOpen = 0; // 현재 열려있는 라운드
let userChoices = ['', '', '']; // 사용자 선택을 저장하는 배열

// 초기화 함수입니다.
const init = () => {
	$('.labels').hide(); // 결과 레이블을 숨깁니다.
	$('.button-group').hide(); // 버튼 그룹을 숨깁니다.
	iOpen = 0; // 라운드를 초기화합니다.
	userChoices = ['', '', '']; // 사용자 선택을 초기화합니다.

	deck.removeCard(cards.all); // 덱을 초기화합니다.
	deck.addCards(cards.all);
	cards.shuffle(deck);
	deck.render({ immediate: true });

	// 상단과 하단의 핸드를 생성합니다. 상단 핸드는 앞면이 가려져 있고, 하단 핸드는 앞면이 보이도록 설정합니다.
	upperhand = new cards.Hand({ faceUp: false, y: 60 });
	lowerhand = new cards.Hand({ faceUp: true, y: 340 });
}

// '게임시작' 버튼을 클릭했을 때의 처리입니다.
$('#deal').click(() => {
	$('#deal').hide(); // '게임시작' 버튼을 숨깁니다.
	$('#reset').hide(); // '다시시작' 버튼을 숨깁니다.
	$('.button-group').hide();
	init(); // 초기화합니다.
	deck.deal(3, [upperhand, lowerhand], 100, () => {
			showButtonGroup(iOpen); // 첫 번째 라운드에 대한 버튼 그룹을 표시합니다.
			$('#open').show(); // '카드열기' 버튼을 표시합니다.
	});
});

// 각 버튼 클릭 시 선택한 값을 처리하는 함수입니다.
$('.button-group button').click(function () {
	let choice = $(this).text(); // 클릭한 버튼의 텍스트를 가져옵니다.
	$(`#result-${iOpen}`).text(`${iOpen + 1}. ${choice}`).show(); // 선택한 값을 표시합니다.
	userChoices[iOpen] = choice; // 사용자의 선택을 기록합니다.

	if (iOpen < 2) { // 모든 라운드가 선택되지 않았을 경우
			iOpen++; // 다음 라운드로 이동합니다.
			showButtonGroup(iOpen); // 다음 라운드에 대한 버튼 그룹을 표시합니다.
	} else { // 모든 라운드가 선택된 경우
			$('#open').show(); // '카드열기' 버튼을 표시합니다.
	}
});

$('#open').click(() => {
	$('.button-group').hide();
	if (userChoices.every(choice => choice !== '')) { // High Low Same 선택이 모두 완료된 경우에만 실행
			// 각 카드 확인을 순차적으로 실행하기 위해 setTimeout 사용
			revealNextCard(0); // 첫 번째 카드 확인부터 시작
	} else {
			showPopup('High Low Same 선택을 완료해주세요.');
			$('.button-group').show(); // 선택이 완료되지 않은 경우 경고 메시지를 표시합니다.
	}
});

// 각 카드 확인을 순차적으로 실행하기 위한 함수입니다.
function revealNextCard(i) {
	if (i < 3) {
			for (const card of deck) {
					card.moveTo(50, card.y, 100); // 카드 이동 애니메이션
			}
			upperhand[i].moveTo(upperhand[i].x, 130, 50, () => {
					upperhand[i].showCard(); // 상단 핸드의 카드를 보여줍니다.
			});

			lowerhand[i].moveTo(lowerhand[i].x, 270, 50, () => {
					let userChoice = userChoices[i]; // 사용자의 선택을 가져옵니다.
					let result; // 게임 결과를 저장할 변수

					// 각 카드의 순서에 따라 비교를 수행합니다.
					// A와 0이 비교될 때 Same으로 처리합니다.
					if ((lowerhand[i].rank === 2 && upperhand[i].rank === 3) || (lowerhand[i].rank === 3 && upperhand[i].rank === 2)) {
							result = 'Same';
					} else {
							// A가 10보다 큰 경우를 고려하여 비교합니다.
							if (lowerhand[i].rank === 2 && (upperhand[i].rank === 13 || upperhand[i].rank === 2)) {
									result = 'High'; // A가 10보다 큰 경우 High를 결정
							} else if (upperhand[i].rank === 2 && (lowerhand[i].rank === 13 || lowerhand[i].rank === 2)) {
									result = 'Low'; // A가 10보다 작은 경우 Low를 결정
							} else {
									// 나머지 경우에는 일반적인 비교를 수행합니다.
									if (lowerhand[i].rank > upperhand[i].rank) {
											result = 'High'; // 일반적인 경우에 High를 결정
									} else if (lowerhand[i].rank < upperhand[i].rank) {
											result = 'Low'; // 일반적인 경우에 Low를 결정
									} else if (lowerhand[i].rank == upperhand[i].rank) {
											result = 'Same'; // 일반적인 경우에 Same을 결정
									}
							}
					}

					// 결과를 표시합니다.
					$(`#label-${i}`).text(userChoice === result ? 'Win' : 'Lose').show();

					if (i === 2) {
							$('#open').hide(); // '카드열기' 버튼을 숨깁니다.
							$('#reset').show(); // '다시시작' 버튼을 표시합니다.
					} else {
							$('#open').show(); // '카드열기' 버튼을 표시합니다.
					}
			});
	}
}

// '다시시작' 버튼을 클릭했을 때의 처리입니다.
$('#reset').click(() => {
	$('#deal').show(); // '게임시작' 버튼을 표시합니다.
	$('#open').hide(); // '카드열기' 버튼을 숨깁니다.
	$('.labels').hide(); // 결과 레이블을 숨깁니다.
	$('.button-group').hide(); // 버튼 그룹을 숨깁니다.
	$('#reset').hide();
	$('.button-group button').removeClass('active');
	$('.results').hide(); // 각 선택된 결과를 초기화하고 숨깁니다.

	init(); // 초기화합니다.
});

// 팝업을 표시하는 함수입니다.
function showPopup(message) {
	$('#popup-message').text(message); // 팝업 메시지를 설정합니다.
	$('#popup').fadeIn(); // 팝업을 표시합니다.
	setTimeout(() => {
			$('#popup').fadeOut(); // 일정 시간 후에 팝업을 숨깁니다.
	}, 2000); // 2초 후에 팝업을 숨깁니다.
}

// 버튼 그룹을 표시하는 함수입니다.
function showButtonGroup(round) {
	$('.button-group').hide(); // 모든 버튼 그룹을 숨깁니다.
	$(`#button-group-${round}`).show(); // 특정 라운드에 대한 버튼 그룹을 표시합니다.
}

$('.button-group').hide();
init(); // 게임 초기화
