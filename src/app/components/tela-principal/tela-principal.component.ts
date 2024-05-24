import { Component } from '@angular/core';
import { Conta } from '../../interfaces/request/Conta';
import { ContaService } from '../../service/conta.service';

@Component({
  selector: 'app-tela-principal',
  templateUrl: './tela-principal.component.html',
  styleUrl: './tela-principal.component.css'
})
export class TelaPrincipalComponent {
  conta : Conta = {
    customerName: "" ,
    accountNumber: "",
    accountAgency: "",
    value: 0.0
  };

  constructor(private contaService: ContaService){}
ngOnInit(): void {
  this.contaService.accountInfo().subscribe((getConta)=>{
    this.conta = getConta;
  })
}
getCurrentDate(): string {
  return new Date().toLocaleDateString();
}
formatarMoeda(): string{
  return this.conta.value.toFixed(2).replace('.',',');
}
componenteAtual: string = 'extrato'
  mostrarComponente(componente: string) {
    this.componenteAtual = componente;
}
}
