import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PixService } from '../../service/pix.service';
import { TransferenciaPix } from '../../interfaces/request/TransferenciaPix';
import { ContaDestinoResponse } from '../../interfaces/response/ContaDestinoResponse';
import { ErroResponse } from '../../interfaces/response/ErroResponse';
import { TransferenciaPixResponse } from '../../interfaces/response/TransferenciaPixResponse';
import { DadosDestino } from '../../interfaces/response/DadosDestino';
import { switchMap, of, catchError } from 'rxjs';
import { ContaService } from '../../service/conta.service';
import { Conta } from '../../interfaces/request/Conta';

@Component({
  selector: 'app-tela-digite-valor',
  templateUrl: './tela-digite-valor.component.html',
  styleUrl: './tela-digite-valor.component.css'
})
export class TelaDigiteValorComponent {

  constructor(private contaService: ContaService, private router: Router, private pixService: PixService, private route: ActivatedRoute) { }

  contaLogada!: Conta;
  
  transferencia: TransferenciaPix = {
    pixKey: '',
    value: 0,
  }
  valorTransferencia: number = 0;
  contaDestinoResponse!: ContaDestinoResponse;
  dadosContaDestino!: DadosDestino


  ngOnInit(): void {
    if(localStorage.getItem('jwtToken') == null){
      this.router.navigate(['/login']);
    }
    // Remove o fundo escuro do modal anterior
    const backGroundEscuro = document.querySelector('.modal-backdrop');
    if (backGroundEscuro != null) {
      backGroundEscuro.remove();
    }
    this.route.queryParams.subscribe((params) => {
        this.transferencia.pixKey = params['key'];
        console.log(params['key']);
        console.log(this.transferencia);
      
        this.pixService.buscarContaPorChavePix(params['key']).subscribe((response: ContaDestinoResponse | ErroResponse) => {
          if ('status' in response) {
            alert(response.message);
          } else {
            this.contaDestinoResponse = response;
            console.log(this.contaDestinoResponse);
          }

          if(this.contaDestinoResponse){
            this.pixService.buscarDadosContaDestino(this.contaDestinoResponse.idAccount).subscribe((response: DadosDestino | ErroResponse) => {
              if ('status' in response) {
                alert(response.message);
              } else {
                this.dadosContaDestino = response;
                console.log(this.dadosContaDestino);
              }
            })
          }
          this.contaService.accountInfo().subscribe((conta) =>{
            this.contaLogada = conta;
          })
        })
    })
  }
  confirmarTransferencia(){


    console.log(this.transferencia)
   
    this.pixService.transferenciaPix(this.transferencia).subscribe((response: TransferenciaPixResponse | ErroResponse)=>{

      console.log(this.transferencia)
      if ('status' in response){
        alert(response.message);
        if(response.status == 200){
          this.router.navigate(['/tela-principal'])
        }
      } else{
        alert("Transferecia concluída com sucesso");
        this.router.navigate(['/tela-principal'])
      }
    })
  }

  cancelarTransferencia(){
    this.router.navigate(['/tela-principal'])
  }
  mascaraValor(event: any) {
    let input = event.target as HTMLInputElement;
    let numero = input.value.replace(/\D/g, '');

    if (numero === '') {
      input.value = '0,00';
    }

    if (numero.length === 1) {
        // Se o usuário digitou apenas um número, adicionamos zeros à esquerda e uma vírgula
        input.value = '0,0' + numero;
    } else if (numero.length === 2) {
        // Se o usuário digitou dois números, adicionamos zeros à esquerda e uma vírgula
        input.value = '0,' + numero;
    } else {
        // Se o número tem mais de dois dígitos, removemos um zero à esquerda a cada nova digitação
        let parteInteira = numero.substring(0, numero.length - 2).replace(/^0+/, ''); // Remove zeros à esquerda
        let parteDecimal = numero.substring(numero.length - 2);
        input.value = parteInteira + ',' + parteDecimal;
    }
    this.transferencia.value = this.formatarValor(numero);
}

formatarValor(valor: string): number {
  let valorSemFormato = valor.replace(/\D/g, '').replace(/,/g, '');
  let valorNumerico = parseFloat(valorSemFormato);
  let valorParaRequisicao = valorNumerico.toFixed(2);

  return parseFloat(valorParaRequisicao) / 100;
}
}
