// TIL INDEX

const bilder = document.querySelectorAll('.historieBoksS img');

function checkSlide() {
    bilder.forEach(bilde => {
        const slideInAt = (window.scrollY + window.innerHeight) - bilde.height / 2;
        const imageBottom = bilde.offsetTop + bilde.height;
        const isHalfShown = slideInAt > bilde.offsetTop;
        const isNotScrolledPast = window.scrollY < imageBottom;

        if (isHalfShown && isNotScrolledPast) {
            bilde.style.opacity = '1';
            bilde.style.transform = 'translateY(0)';
        }
    });
}

window.addEventListener('scroll', checkSlide);

        // Brettet
        let brett;
        let brettBredde = 600;
        let brettHøyde = 500;
        let kontekst;

        // Spillerne
        let spillerBredde = 10;
        let spillerHøyde = 75;

        let spiller1 = {
            x: 10,
            y: brettHøyde / 2,
            bredde: spillerBredde,
            høyde: spillerHøyde,
            fartY: 0,
            fart: 3
        }

        let spiller2 = {
            x: brettBredde - spillerBredde - 10,
            y: brettHøyde / 2,
            bredde: spillerBredde,
            høyde: spillerHøyde,
            fartY: 0,
            fart: 3
        }

        // Ball
        let ballBredde = 10;
        let ballHøyde = 10;
        let ball = {
            x: brettBredde / 2,
            y: brettHøyde / 2,
            bredde: ballBredde,
            høyde: ballHøyde,
        }

        // Poeng og spillinnstillinger
        let spiller1Poeng = 0;
        let spiller2Poeng = 0;
        let spillModus = 'flerspiller';
        let spillStartet = false;

        // Klargjøring når vinduet lastes
        window.onload = function () {
            brett = document.getElementById("brett");
            brett.height = brettHøyde;
            brett.width = brettBredde;
            kontekst = brett.getContext("2d");

            requestAnimationFrame(oppdater);
            document.addEventListener("keydown", bevegSpiller);
            document.addEventListener("keyup", stoppSpiller);
        }

        // Start enspiller-modus
        function startEnspiller() {
            spillModus = 'enspiller';
            document.getElementById("aiVanskelighetsgrad").style.display = "block";
            spiller1Poeng = 0;
            spiller2Poeng = 0;
            resetSpill(1);
            spillStartet = false;
        }

        // Sett AI vanskelighetsgrad
        function settAIVanskelighetsgrad(vanskelighetsgrad) {
            aiVanskelighetsgrad = vanskelighetsgrad;
            startSpill('enspiller');
        }

        // Start spillet
        function startSpill(modus) {
            spillModus = modus;
            document.getElementById("aiVanskelighetsgrad").style.display = "none";
            spiller1Poeng = 0;
            spiller2Poeng = 0;
            resetSpill(1);
            spillStartet = true;
        }

        // Oppdatering
        function oppdater() {
            requestAnimationFrame(oppdater);
            kontekst.clearRect(0, 0, brett.width, brett.height);

            if (!spillStartet) return;

            // Spiller 1
            kontekst.fillStyle = "orange";
            let nesteSpiller1Y = spiller1.y + spiller1.fartY * spiller1.fart;
            if (!utenforBrett(nesteSpiller1Y)) {
                spiller1.y = nesteSpiller1Y;
            }
            kontekst.fillRect(spiller1.x, spiller1.y, spillerBredde, spillerHøyde);

            // Spiller 2
            if (spillModus === 'enspiller') {
                let nesteSpiller2Y = spiller2.y + (ball.y - (spiller2.y + spiller2.høyde / 2)) * aiVanskelighetsgrad;
                if (!utenforBrett(nesteSpiller2Y)) {
                    spiller2.y = nesteSpiller2Y;
                }
            } else {
                let nesteSpiller2Y = spiller2.y + spiller2.fartY * spiller2.fart;
                if (!utenforBrett(nesteSpiller2Y)) {
                    spiller2.y = nesteSpiller2Y;
                }
            }
            kontekst.fillRect(spiller2.x, spiller2.y, spillerBredde, spillerHøyde);

            // Ball
            kontekst.fillStyle = "yellow";
            ball.x += ball.fartX;
            ball.y += ball.fartY;
            kontekst.fillRect(ball.x, ball.y, ballBredde, ballHøyde);

            // Ballen treffer topp/bunn
            if (ball.y <= 0 || (ball.y + ballHøyde >= brettHøyde)) {
                ball.fartY *= -1;
            }

            // Treffer spillerne
            if (oppdagKollisjon(ball, spiller1)) {
                let deltaY = ball.y - (spiller1.y + spiller1.høyde / 2);
                ball.fartX = Math.abs(ball.fartX);
                ball.fartY = deltaY * 0.2;
                spillKollisjonsLyd();
            } else if (oppdagKollisjon(ball, spiller2)) {
                let deltaY = ball.y - (spiller2.y + spiller2.høyde / 2);
                ball.fartX = -Math.abs(ball.fartX);
                ball.fartY = deltaY * 0.2;
                spillKollisjonsLyd();
            }

            // Poeng
            if (ball.x < 0) {
                spiller2Poeng++;
                resetSpill(1);
            } else if (ball.x + ballBredde > brettBredde) {
                spiller1Poeng++;
                resetSpill(-1);
            }

            // Sjekk vinner
            if (spiller1Poeng >= 5 || spiller2Poeng >= 5) {
                visMelding(spiller1Poeng >= 5 ? "Spiller 1 vinner!" : "Spiller 2 vinner!");
                ball.fartX = 0;
                ball.fartY = 0;
            }

            // Tegn poeng
            kontekst.font = "45px sans-serif";
            kontekst.fillText(spiller1Poeng, brettBredde / 5, 45);
            kontekst.fillText(spiller2Poeng, brettBredde * 4 / 5 - 45, 45);

            // Tegn midtstreken
            for (let i = 10; i < brett.height; i += 25) {
                kontekst.fillRect(brett.width / 2 - 10, i, 5, 5);
            }
        }

        // Sjekk om en spiller er utenfor brettet
        function utenforBrett(yPosisjon) {
            return (yPosisjon < 0 || yPosisjon + spillerHøyde > brettHøyde);
        }

        // Bevegelse
        function bevegSpiller(e) {
            if (e.code == "KeyW") {
                spiller1.fartY = -1.5;
            } else if (e.code == "KeyS") {
                spiller1.fartY = 1.5;
            }
            if (e.code == "ArrowUp") {
                spiller2.fartY = -1.5;
            } else if (e.code == "ArrowDown") {
                spiller2.fartY = 1.5;
            }
        }

        function stoppSpiller(e) {
            if (e.code == "KeyW" || e.code == "KeyS") {
                spiller1.fartY = 0;
            }
            if (e.code == "ArrowUp" || e.code == "ArrowDown") {
                spiller2.fartY = 0;
            }
        }

        // Kollisjon ball, spiller
        function oppdagKollisjon(a, b) {
            return a.x < b.x + b.bredde &&
                a.x + a.bredde > b.x &&
                a.y < b.y + b.høyde &&
                a.y + a.høyde > b.y;
        }

        // Reset spill
        function resetSpill(retning) {
            ball = {
                x: brettBredde / 2,
                y: brettHøyde / 2,
                bredde: ballBredde,
                høyde: ballHøyde,
                fartX: retning * 5,
                fartY: 0
            }
        }

        // Vise en melding/alert og starte spillet på nytt
        function visMelding(melding) {
            alert(melding);
            startSpill(spillModus);
        }

        // Lyd ved kollisjon
        function spillKollisjonsLyd() {
            let kollisjonsLyd = document.getElementById("kollisjonsLyd");
            kollisjonsLyd.currentTime = 0;
            kollisjonsLyd.play();
        }
